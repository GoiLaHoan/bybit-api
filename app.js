const { RestClientV5 } = require('bybit-api');
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
// Create an instance of express
const app = express();

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

app.set('trust proxy', true);

app.get('/', (req, res) => {
    return res.json({ message: 'Hello World!' });
});

app.get('/ipv4', (req, res) => {
    const ipAddress = req.ip;
    return res.json({ message: `Hello! Your IP address is: ${ipAddress}` });
});

function convertFloat(inputNumber) {
    const floatNumber = parseFloat(inputNumber);

    // Chuyển số thành chuỗi và tách phần nguyên và phần thập phân
    const parts = floatNumber.toString().split('.');

    // Lấy phần thập phân và giữ lại chỉ 2 số sau dấu thập phân
    const result = `${parts[0]}.${(parts[1] ? parts[1].slice(0, 2) : '00')}`;
    return result
}

function getCurrentTimestamp() {
    return Date.now()
}

// Hàm sleep để chờ 1 giây
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Define the POST endpoint
app.get('/trade', async (req, res) => {
    const { coinName, API_KEY, API_SECRET, sotienmua } = req.query;
    const symbol = `${coinName}USDT`;

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });

    // Call your trade function here passing the parameters from the request body
    try {
        let priceBuy = '0.01'
        let priceSell = '9999'
        let equityUSDT = null
        let equitySell = null
        let openOrder = []

        // Lấy số dư USDT ví UNIFIED
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: 'USDT',
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng usdt đang có trong ví UNIFIED

                equityUSDT = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });


        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceBuy = response.result.a[0][0]; // giá mua gần nhất
            })
            .catch((error) => {
                console.error(error);
            });


        // Mua giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Buy',
                orderType: 'Limit',
                qty: sotienmua ? convertFloat(sotienmua / priceBuy) : convertFloat(equityUSDT / priceBuy),
                price: priceBuy,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });


        // Check coin đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng coin đang có trong ví
                equitySell = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceSell = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell, // bán hết
                price: priceSell,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        async function placeSellOrder() {
            await client
                .submitOrder({
                    category: 'spot',
                    symbol,
                    side: 'Sell',
                    orderType: 'Limit',
                    qty: equitySell,
                    price: priceSell,
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        async function cancelAllOrders() {
            await client
                .cancelAllOrders({
                    category: 'spot',
                    settleCoin: 'USDT',
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        async function checkAndPlaceOrder() {
            await client
                .getActiveOrders({
                    category: 'spot',
                    symbol: symbol,
                    openOnly: 0,
                    limit: 1,
                })
                .then((response) => {
                    openOrder = response?.result?.list;
                })
                .catch((error) => {
                    console.error(error);
                });

            if (openOrder.length !== 0) {
                await cancelAllOrders();
                await placeSellOrder();
            }
        }

        let iterations = 0; // Initialize a counter variable
        const maxIterations = 3; // Set the maximum number of iterations

        // Kiểm tra mỗi 1 giây
        const intervalId = setInterval(async () => {
            await checkAndPlaceOrder();

            // Tăng biến đếm sau mỗi lần lặp
            iterations++;

            // Kiểm tra điều kiện dừng
            if (openOrder.length === 0 || iterations >= maxIterations) {
                clearInterval(intervalId); // Dừng vòng lặp nếu đạt điều kiện
            }
        }, 500);


        // Return a success response
        res.json({ message: 'Trade executed successfully' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

const arrData = [
    { apiKey: '6UkT2PaKJtbsba2BiB', secretKey: 'g5Eenaw3br41sFZ6t4tNTeht02slXqZpt3eg' },
    { apiKey: 'bCtzcQwDwxK5XDSvWN', secretKey: '5NwvV6aU3wgglQ9uJWp8C473M7ncGqyHkDce' },
    { apiKey: 'ASDXOp4TT8p7HwD5Kk', secretKey: 'zpguOGNC8sE23oKZHh2YMvSSuA84mEA8uWdb' },
    { apiKey: 'b8PDTwkByQvuULtbCz', secretKey: '5itzUOergKoQRbGWAWeF9XrxEwPtZpVlF3qK' },
    { apiKey: 'A5mCHigKIVfQQ6IcTh', secretKey: 'ue4kJP9INHh3O9oOSKzOCZG4FWjMKIktbCfy' },
    { apiKey: 'zBsXqax2KgyQLFssQF', secretKey: 'zyWqRdUveUk6tvcbrNIiCS39V3Ojkh69SsOp' },
    { apiKey: 'uesUi3Eu9nhhK6TkJE', secretKey: 'elaQO0BeN2DXkdLzaAvg1MtF6Pz6PipAdAbk' },
    { apiKey: 'YOSnzlV8vmNk1lTasr', secretKey: 's8F0aaQOrLcAPnd5c0zS67yqVx3O060I27as' },
    { apiKey: '5S4lmd2Bv0MbBPAAGK', secretKey: '4hk8PmG7JcYk98uEhLFx4EWEBBkH8xtbeniC' },
    { apiKey: 'XH4JpFK5M6Ai7tuEGB', secretKey: 'Ll6O8KnTdibnbMKILb0OXPPSs1mHLbGaoB81' }
];


// Define the POST endpoint
app.get('/tradeHuy', async (req, res) => {
    const { coinName } = req.query;

    const trade = async (coinName, apiKey, secretKey) => {
        const symbol = `${coinName}USDT`;
        const client = new RestClientV5({
            key: apiKey,
            secret: secretKey,
            testnet: false,
        });


        let priceBuy = '0.01'
        let priceSell = '9999'
        let equityUSDT = null
        let equitySell = null
        let openOrder = []

        // Lấy số dư USDT ví UNIFIED
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: 'USDT',
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].equity; // số lượng usdt đang có trong ví UNIFIED

                equityUSDT = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });


        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceBuy = response.result.a[0][0]; // giá mua gần nhất
            })
            .catch((error) => {
                console.error(error);
            });


        // Mua giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Buy',
                orderType: 'Limit',
                qty: convertFloat(equityUSDT / priceBuy),
                price: priceBuy,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });


        // Check coin đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].equity; // số lượng coin đang có trong ví
                equitySell = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceSell = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell, // bán hết
                price: priceSell,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        async function placeSellOrder() {
            await client
                .submitOrder({
                    category: 'spot',
                    symbol,
                    side: 'Sell',
                    orderType: 'Limit',
                    qty: equitySell,
                    price: priceSell,
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        async function cancelAllOrders() {
            await client
                .cancelAllOrders({
                    category: 'spot',
                    settleCoin: 'USDT',
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        async function checkAndPlaceOrder() {
            await client
                .getActiveOrders({
                    category: 'spot',
                    symbol: symbol,
                    openOnly: 0,
                    limit: 1,
                })
                .then((response) => {
                    openOrder = response?.result?.list;
                })
                .catch((error) => {
                    console.error(error);
                });

            if (openOrder.length !== 0) {
                await cancelAllOrders();
                await placeSellOrder();
            }
        }

        let iterations = 0; // Initialize a counter variable
        const maxIterations = 3; // Set the maximum number of iterations

        // Kiểm tra mỗi 1 giây
        const intervalId = setInterval(async () => {
            await checkAndPlaceOrder();

            // Tăng biến đếm sau mỗi lần lặp
            iterations++;

            // Kiểm tra điều kiện dừng
            if (openOrder.length === 0 || iterations >= maxIterations) {
                clearInterval(intervalId); // Dừng vòng lặp nếu đạt điều kiện
            }
        }, 500);
    }

    arrData.forEach(element => {
        trade(coinName, element.apiKey, element.secretKey)
    });

    res.json({ message: 'Trade executed successfully' });

});

// Define the POST endpoint
app.get('/sellcoin', async (req, res) => {
    const { coinName, API_KEY, API_SECRET } = req.query;
    const symbol = `${coinName}USDT`;

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });

    // Call your trade function here passing the parameters from the request body
    try {
        let priceSell = '9999'
        let equitySell = null
        let equityUNIFIEDUSDT = null;

        let qtyCoin = '0'
        const transferId1 = uuidv4();
        const transferId2 = uuidv4();

        await client
            .getAllCoinsBalance({ accountType: 'FUND', coin: coinName })
            .then((response) => {
                console.log('response', response.result.balance[0].transferBalance);
                qtyCoin = String(response.result.balance[0].transferBalance)
            })
            .catch((error) => {
                console.error(error);
            });

        // chuyen so tien co the rut sang UNIFIED
        await client
            .createInternalTransfer(
                transferId1,
                coinName,
                qtyCoin,
                'FUND',
                'UNIFIED',
            )
            .then((response) => {
                console.log('response', response);
            })
            .catch((error) => {
                console.error(error);
            });

        // Check coin đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng coin đang có trong ví
                equitySell = String(convertFloat(equity))
                console.log('equity', equity);
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceSell = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell, // bán hết
                price: priceSell,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        await sleep(1000); // Chờ 1 giây

        // Lấy số dư USDT ví UNIFIED
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: 'USDT',
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng usdt đang có trong ví UNIFIED
                equityUNIFIEDUSDT = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        await sleep(1000); // Chờ 1 giây

        // chuyen so tien co the rut sang funding
        await client
            .createInternalTransfer(
                transferId2,
                'USDT',
                equityUNIFIEDUSDT,
                'UNIFIED',
                'FUND',
            )
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        // Return a success response
        res.json({ message: 'Trade executed successfully' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

app.get('/sellcoinold', async (req, res) => {
    const { coinName, API_KEY, API_SECRET } = req.query;
    const symbol = `${coinName}USDT`;

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });

    // Call your trade function here passing the parameters from the request body
    try {
        let priceSell = '9999'
        let equitySell = null

        let qtyCoin = '0'
        const transferId1 = uuidv4();

        await client
            .getAllCoinsBalance({ accountType: 'FUND', coin: coinName })
            .then((response) => {
                console.log('response', response.result.balance[0].transferBalance);
                qtyCoin = String(response.result.balance[0].transferBalance)
            })
            .catch((error) => {
                console.error(error);
            });

        // chuyen so tien co the rut sang UNIFIED
        await client
            .createInternalTransfer(
                transferId1,
                coinName,
                qtyCoin,
                'FUND',
                'UNIFIED',
            )
            .then((response) => {
                console.log('response', response);
            })
            .catch((error) => {
                console.error(error);
            });

        // Check coin đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng coin đang có trong ví
                equitySell = String(convertFloat(equity))
                console.log('equity', equity);
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceSell = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell, // bán hết
                price: priceSell,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        // Return a success response
        res.json({ message: 'Trade executed successfully' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

app.get('/trade2', async (req, res) => {
    const { coinName1, coinName2, API_KEY, API_SECRET } = req.query;
    const symbol1 = `${coinName1}USDT`;
    const symbol2 = `${coinName2}USDT`;


    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });

    // Call your trade function here passing the parameters from the request body
    try {
        let priceBuy1 = '0.01'
        let priceBuy2 = '0.01'
        let priceSell1 = '9999'
        let priceSell2 = '9999'
        // let equityUSDT = null
        let equitySell1 = null
        let equitySell2 = null
        // let openOrder = []

        // Lấy số dư USDT ví UNIFIED
        // await client
        //     .getWalletBalance({
        //         accountType: 'UNIFIED',
        //         coin: 'USDT',
        //     })
        //     .then((response) => {
        //         const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng usdt đang có trong ví UNIFIED

        //         equityUSDT = String(convertFloat(equity))
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });


        // Lấy giá mua gần nhất của đồng coin 1
        await client
            .getOrderbook({
                category: 'spot',
                symbol: symbol1,
            })
            .then((response) => {
                priceBuy1 = response.result.a[0][0]; // giá mua gần nhất
            })
            .catch((error) => {
                console.error(error);
            });


        // Mua giá gần nhất đồng coin 1
        await client
            .submitOrder({
                category: 'spot',
                symbol: symbol1,
                side: 'Buy',
                orderType: 'Limit',
                qty: convertFloat('5' / priceBuy1),
                price: priceBuy1,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua gần nhất của đồng coin 2
        await client
            .getOrderbook({
                category: 'spot',
                symbol: symbol2,
            })
            .then((response) => {
                priceBuy2 = response.result.a[0][0]; // giá mua gần nhất
            })
            .catch((error) => {
                console.error(error);
            });


        // Mua giá gần nhất đồng coin 2
        await client
            .submitOrder({
                category: 'spot',
                symbol: symbol2,
                side: 'Buy',
                orderType: 'Limit',
                qty: convertFloat('5' / priceBuy2),
                price: priceBuy2,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });


        // Check coin 1 đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName1,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng coin đang có trong ví
                equitySell1 = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua gần nhất của đồng coin 1
        await client
            .getOrderbook({
                category: 'spot',
                symbol: symbol1,
            })
            .then((response) => {
                priceSell1 = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất đồng coin 1
        await client
            .submitOrder({
                category: 'spot',
                symbol: symbol1,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell1, // bán hết
                price: priceSell1,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        // Check coin 2 đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName2,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng coin đang có trong ví
                equitySell2 = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua gần nhất của đồng coin 2
        await client
            .getOrderbook({
                category: 'spot',
                symbol: symbol2,
            })
            .then((response) => {
                priceSell2 = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất đồng coin 2
        await client
            .submitOrder({
                category: 'spot',
                symbol: symbol2,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell2, // bán hết
                price: priceSell2,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        // async function placeSellOrder() {
        //     await client
        //         .submitOrder({
        //             category: 'spot',
        //             symbol,
        //             side: 'Sell',
        //             orderType: 'Limit',
        //             qty: equitySell,
        //             price: priceSell,
        //         })
        //         .then((response) => {
        //             console.log(response);
        //         })
        //         .catch((error) => {
        //             console.error(error);
        //         });
        // }

        // async function cancelAllOrders() {
        //     await client
        //         .cancelAllOrders({
        //             category: 'spot',
        //             settleCoin: 'USDT',
        //         })
        //         .then((response) => {
        //             console.log(response);
        //         })
        //         .catch((error) => {
        //             console.error(error);
        //         });
        // }

        // async function checkAndPlaceOrder() {
        //     await client
        //         .getActiveOrders({
        //             category: 'spot',
        //             symbol: symbol,
        //             openOnly: 0,
        //             limit: 1,
        //         })
        //         .then((response) => {
        //             openOrder = response?.result?.list;
        //         })
        //         .catch((error) => {
        //             console.error(error);
        //         });

        //     if (openOrder.length !== 0) {
        //         await cancelAllOrders();
        //         await placeSellOrder();
        //     }
        // }

        // let iterations = 0; // Initialize a counter variable
        // const maxIterations = 3; // Set the maximum number of iterations

        // // Kiểm tra mỗi 1 giây
        // const intervalId = setInterval(async () => {
        //     await checkAndPlaceOrder();

        //     // Tăng biến đếm sau mỗi lần lặp
        //     iterations++;

        //     // Kiểm tra điều kiện dừng
        //     if (openOrder.length === 0 || iterations >= maxIterations) {
        //         clearInterval(intervalId); // Dừng vòng lặp nếu đạt điều kiện
        //     }
        // }, 500);


        // Return a success response
        res.json({ message: 'Trade executed successfully' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});
app.get('/ruttien', async (req, res) => {
    const { API_KEY, API_SECRET, diachiruttien } = req.query;

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });



    try {
        let sotiencotherut = 0;
        let equityUNIFIEDUSDT = null;
        const transferId1 = uuidv4();
        const transferId2 = uuidv4();

        // Lấy số dư USDT ví UNIFIED
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: 'USDT',
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].availableToWithdraw; // số lượng usdt đang có trong ví UNIFIED
                equityUNIFIEDUSDT = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        await sleep(1000); // Chờ 1 giây

        // chuyen so tien co the rut sang funding
        await client
            .createInternalTransfer(
                transferId1,
                'USDT',
                equityUNIFIEDUSDT,
                'UNIFIED',
                'FUND',
            )
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        await sleep(2000); // Chờ 2 giây

        // chuyen 5$ sang giao ngay
        await client
            .createInternalTransfer(
                transferId2,
                'USDT',
                '5',
                'FUND',
                'UNIFIED',
            )
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        await sleep(2000); // Chờ 2 giây

        // 
        // client
        //     .getCoinInfo('USDT')
        //     .then((response) => {
        //         console.log(response?.result?.rows[0]?.chains.find(item => item.chain === 'BSC').withdrawFee);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });

        // kiem tra so tien co the rut
        await client
            .getWithdrawableAmount({
                coin: 'USDT',
            })
            .then((response) => {
                sotiencotherut = Number(response?.result?.withdrawableAmount?.FUND?.withdrawableAmount) - 0.3;
            })
            .catch((error) => {
                console.error(error);
            });

        await sleep(1000); // Chờ 1 giây

        if (sotiencotherut >= 0) {
            // rut tien
            await client
                .submitWithdrawal({
                    coin: 'USDT',
                    chain: 'BSC',
                    address: diachiruttien,
                    amount: convertFloat(sotiencotherut),
                    timestamp: getCurrentTimestamp(),
                    forceChain: 0,
                    accountType: 'FUND',
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
        // Return a success response
        res.json({ message: 'Rut thanh cong' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

app.get('/tradeLoop', async (req, res) => {
    const { coinName, API_KEY, API_SECRET } = req.query;
    let totalTrade = 0;
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    })

    const symbol = `${coinName}USDT`;
    const trade = async () => {


        let priceBuy = '0.01'
        let priceSell = '9999'
        let equityUSDT = null
        let equitySell = null
        let openOrder = []

        // Lấy số dư USDT ví UNIFIED
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: 'USDT',
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].equity; // số lượng usdt đang có trong ví UNIFIED

                equityUSDT = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });


        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceBuy = response.result.a[0][0]; // giá mua gần nhất
            })
            .catch((error) => {
                console.error(error);
            });


        // Mua giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Buy',
                orderType: 'Limit',
                qty: convertFloat(equityUSDT / priceBuy),
                price: priceBuy,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });


        // Check coin đã có trong ví chưa
        await client
            .getWalletBalance({
                accountType: 'UNIFIED',
                coin: coinName,
            })
            .then((response) => {
                const equity = response.result.list[0].coin[0].equity; // số lượng coin đang có trong ví
                equitySell = String(convertFloat(equity))
            })
            .catch((error) => {
                console.error(error);
            });

        // Lấy giá mua và giá bán gần nhất của đồng coin
        await client
            .getOrderbook({
                category: 'spot',
                symbol,
            })
            .then((response) => {
                priceSell = response.result.b[0][0]; //giá bán gần nhất
            })
            .catch((error) => {
                console.error(error);
            });

        // Bán giá gần nhất
        await client
            .submitOrder({
                category: 'spot',
                symbol,
                side: 'Sell',
                orderType: 'Limit',
                qty: equitySell, // bán hết
                price: priceSell,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

        async function placeSellOrder() {
            await client
                .submitOrder({
                    category: 'spot',
                    symbol,
                    side: 'Sell',
                    orderType: 'Limit',
                    qty: equitySell,
                    price: priceSell,
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        async function cancelAllOrders() {
            await client
                .cancelAllOrders({
                    category: 'spot',
                    settleCoin: 'USDT',
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        async function checkAndPlaceOrder() {
            await client
                .getActiveOrders({
                    category: 'spot',
                    symbol: symbol,
                    openOnly: 0,
                    limit: 1,
                })
                .then((response) => {
                    openOrder = response?.result?.list;
                })
                .catch((error) => {
                    console.error(error);
                });

            if (openOrder.length !== 0) {
                await cancelAllOrders();
                await placeSellOrder();
            }
        }

        let iterations = 0; // Initialize a counter variable
        const maxIterations = 3; // Set the maximum number of iterations

        // Kiểm tra mỗi 1 giây
        const intervalId = setInterval(async () => {
            await checkAndPlaceOrder();

            // Tăng biến đếm sau mỗi lần lặp
            iterations++;

            // Kiểm tra điều kiện dừng
            if (openOrder.length === 0 || iterations >= maxIterations) {
                clearInterval(intervalId); // Dừng vòng lặp nếu đạt điều kiện
            }
        }, 500);

    }

    while (totalTrade <= 105) {
        await trade()
        await client
            .getExecutionList({
                category: 'spot',
                symbol: symbol,
            })
            .then((response) => {
                totalTrade = response.result.list.reduce((acc, curr) => acc + parseFloat(curr.execValue), 0)
                console.log(totalTrade);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    res.json({ message: 'Trade executed successfully' });

});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
