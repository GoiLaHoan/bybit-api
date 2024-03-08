const { RestClientV5 } = require('bybit-api');
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { dataHuy1, dataHuy2, dataHuy3 } = require('./dataHuy');
const { dataHoan1 } = require('./dataHoan');
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

app.get('/haha', (req, res) => {
    const client = new RestClientV5(
        {
            key: 'yM2HK9R3EJqSSevggs',
            secret: 'y8vaft9LTWNVByiSZ0vTeEfngKKiFuZC57do',
            testnet: false,
        },
        {
            proxy: {
                host: "qna08.vitechcheap.com",
                port: 20062,
            },
        }
    );
    (async () => {
        try {
            const res = await client.getWalletBalance({ accountType: 'UNIFIED', coin: 'USDT' });
            console.log('response: ', JSON.stringify(res, null, 2));
        } catch (e) {
            console.error('request failed: ', e);
        }
    })();
    const ipAddress = req.ip;
    return res.json({ message: `Hello! Your IP address is: ${ipAddress}` });
});
app.get('/hehe', (req, res) => {
    const client = new RestClientV5(
        {
            key: 'yM2HK9R3EJqSSevggs',
            secret: 'y8vaft9LTWNVByiSZ0vTeEfngKKiFuZC57do',
            testnet: false,
        },
        {
            proxy: {
                host: "14.225.64.164",
                port: 6666,
                auth: { username: "mlxd3g8u", password: "mLxD3g8u" },
            },
        }
    );
    (async () => {
        try {
            const res = await client.getWalletBalance({ accountType: 'UNIFIED', coin: 'USDT' });
            console.log('response: ', JSON.stringify(res, null, 2));
        } catch (e) {
            console.error('request failed: ', e);
        }
    })();
    const ipAddress = req.ip;
    return res.json({ message: `Hello! Your IP address is: ${ipAddress}` });
});
app.get('/hoho', (req, res) => {
    const client = new RestClientV5(
        {
            key: 'yM2HK9R3EJqSSevggs',
            secret: 'y8vaft9LTWNVByiSZ0vTeEfngKKiFuZC57do',
            testnet: false,
        },
        {
            proxy: {
                host: "15.235.138.130",
                port: 59393,
                auth: { username: "fcjz2e2t", password: "fCjZ2e2t" },
            },
        }
    );
    (async () => {
        try {
            const res = await client.getWalletBalance({ accountType: 'UNIFIED', coin: 'USDT' });
            console.log('response: ', JSON.stringify(res, null, 2));
        } catch (e) {
            console.error('request failed: ', e);
        }
    })();
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

// // khai báo totalVolTrade 
// let totalVolTrade = 0;

// Buy coin
async function buyCoin(client, coinName) {
    let equityUSDT = null
    let priceBuy = '0.01'
    const symbol = `${coinName}USDT`;

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


    // Lấy giá mua gần nhất của đồng coin
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
            console.log('Mua thành công');
        })
        .catch((error) => {
            console.error(error);
        });
}

// Sell coin
async function sellCoin(client, coinName) {
    const symbol = `${coinName}USDT`;
    let priceSell = '9999'
    let equitySell = null

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

    // Lấy giá bán gần nhất của đồng coin
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
            console.log('Bán thành công');
        })
        .catch((error) => {
            console.error(error);
        });

}
// cancel order
async function checkAndCancelAllOrders(client, coinName) {
    const symbol = `${coinName}USDT`;
    let openOrder = []
    let isContinue = false;
    async function cancelAllOrders() {
        await client
            .cancelAllOrders({
                category: 'spot',
                settleCoin: 'USDT',
            })
            .then((response) => {
                console.log('Hủy thành công');
            })
            .catch((error) => {
                console.error(error);
            });
    }
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
        // await placeSellOrder();
        isContinue = true
    } else {
        isContinue = false;
    }

    return isContinue
}

// Calculate total trading volume
async function totalVol(client, coinName) {
    const symbol = `${coinName}USDT`;
    let totalVolTrade = 0;
    // tính tổng vol trade    
    await client
        .getExecutionList({
            category: 'spot',
            symbol: symbol,
        })
        .then((response) => {
            totalVolTrade = response.result.list.reduce((acc, curr) => acc + parseFloat(curr.execValue), 0)
            console.log(totalVolTrade);
        })
        .catch((error) => {
            console.error(error);
        });

    return totalVolTrade
}


// trade coin
async function tradeCoin(client, coinName) {
    let isContinue = true;

    await buyCoin(client, coinName);
    while (isContinue) {
        await sellCoin(client, coinName);
        isContinue = await checkAndCancelAllOrders(client, coinName);
    }
}

// trade coin loop
async function tradeCoinLoop(client, coinName, volume) {
    let isContinue = true;
    let volumeCoin = volume ? volume : 105;
    let timeOut = true;
    let totalVolTrade = 0;


    setTimeout(() => {
        timeOut = false; // Sau 20 giây, dừng vòng lặp
    }, 20000); // 20 giây là 10000 miligiây

    while (totalVolTrade < volumeCoin && timeOut) {
        await buyCoin(client, coinName);
        await sellCoin(client, coinName);
        isContinue = await checkAndCancelAllOrders(client, coinName);
        totalVolTrade = await totalVol(client, coinName)
    }
    totalVolTrade = 0;

    while (isContinue && timeOut) {
        await sellCoin(client, coinName);
        isContinue = await checkAndCancelAllOrders(client, coinName);
    }

}

// Mua bán 1 lần
app.get('/trade', async (req, res) => {
    const { coinName, API_KEY, API_SECRET } = req.query;

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });

    // Call your trade function here passing the parameters from the request body
    await tradeCoin(client, coinName)
    // Return a success response
    res.json({ message: 'Trade executed successfully' });

});

// trade nhiều acc 1 lần
app.get('/tradeMul', async (req, res) => {
    const { coinName, type } = req.query;
    const trade = async (apiKey, secretKey) => {
        const client = new RestClientV5(
            {
                key: apiKey,
                secret: secretKey,
                testnet: false,
            }
        );

        await tradeCoin(client, coinName)
    }
    // loop
    async function processElements(arrData) {
        for (const element of arrData) {
            await trade(element.apiKey, element.secretKey);
        }
    }
    switch (type) {
        case '1':
            await processElements(dataHuy1);
            break;
        case '2':
            await processElements(dataHuy2);
            break;
        case '3':
            await processElements(dataHuy3);
            break;
        case '4':
            await processElements(dataHoan1);
            break;
        default:
            break;
    }

    res.json({ message: 'Trade executed successfully' });

});

// Mua bán 1 acc đến khi đủ volume
app.get('/tradeLoop', async (req, res) => {
    const { coinName, API_KEY, API_SECRET, volume } = req.query;
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    })

    await tradeCoinLoop(client, coinName, volume)
    res.json({ message: 'Trade executed successfully' });

});

// Mua bán nhiều acc đến khi đủ volume
app.get('/tradeLoopMul', async (req, res) => {
    const { coinName, type, volume } = req.query;
    const trade = async (apiKey, secretKey, proxy) => {
        const client = new RestClientV5(
            {
                key: apiKey,
                secret: secretKey,
                testnet: false,
            },
            {
                proxy
            }
        );

        await tradeCoinLoop(client, coinName, volume)
    }
    // loop
    async function processElements(arrData) {
        for (const element of arrData) {
            await trade(element.apiKey, element.secretKey, element.proxy);
        }
    }
    switch (type) {
        case '1':
            await processElements(dataHuy1);
            break;
        case '2':
            await processElements(dataHuy2);
            break;
        case '3':
            await processElements(dataHuy3);
            break;
        case '4':
            await processElements(dataHoan1);
            break;
        default:
            break;
    }

    res.json({ message: 'Trade executed successfully' });

});

// bán coin
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

// bán coin acc old
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

// bán coin nhiều acc
app.get('/sellCoinOldMul', async (req, res) => {
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
        let isContinue = true;
        let qtyCoin = '0'
        const transferId1 = uuidv4();
        const transferId2 = uuidv4();
        let equityUNIFIEDUSDT = null;

        // kiểm tra số lượng coin có trong ví FUNDING
        await client
            .getAllCoinsBalance({ accountType: 'FUND', coin: coinName })
            .then((response) => {
                // console.log('response', response.result);
                qtyCoin = String(response.result.balance[0].transferBalance)
            })
            .catch((error) => {
                console.error(error);
            });
        if (parseFloat(qtyCoin) > 0) {
            // chuyển toàn bộ coin sang ví unified
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
            // bán toàn bộ
            while (isContinue) {
                await sellCoin(client, coinName);
                isContinue = await checkAndCancelAllOrders(client, coinName);
            }

        }

        // Return a success response
        res.json({ message: 'Trade executed successfully' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

// rút tiền để lại x$ trong ví UNIFIED
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
                '10',
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

// mua bán 1 lần 2 đồng coin 1 lúc
app.get('/trade2', async (req, res) => {
    const { coinName1, coinName2, API_KEY, API_SECRET } = req.query;

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    });

    // Call your trade function here passing the parameters from the request body
    try {
        await tradeCoin(client, coinName1);
        await tradeCoin(client, coinName2);

        // Return a success response
        res.json({ message: 'Trade executed successfully' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

// mua bán 1 acc 2 đồng coin 1 lúc đến khi đủ volume(cần sửa lại nếu rule volume của 2 đồng là khác nhau)
app.get('/tradeLoop2', async (req, res) => {
    const { coinName1, coinName2, API_KEY, API_SECRET, volume } = req.query;
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
        testnet: false,
    })

    await tradeCoinLoop(client, coinName1, volume);
    await tradeCoinLoop(client, coinName2, volume);
    res.json({ message: 'Trade executed successfully' });

});

// Mua bán nhiều acc 2 đồng coin đến khi đủ volume(cần sửa lại nếu rule volume của 2 đồng là khác nhau)
app.get('/tradeLoopMul2', async (req, res) => {
    const { coinName1, coinName2, type, volume } = req.query;
    const trade = async (apiKey, secretKey) => {
        const client = new RestClientV5({
            key: apiKey,
            secret: secretKey,
            testnet: false,
        });

        await tradeCoinLoop(client, coinName1, volume);
        await tradeCoinLoop(client, coinName2, volume);
    }
    // loop
    async function processElements(arrData) {
        for (const element of arrData) {
            await trade(element.apiKey, element.secretKey);
        }
    }
    switch (type) {
        case '1':
            await processElements(dataHuy1);
            break;
        case '2':
            await processElements(dataHuy2);
            break;
        case '3':
            await processElements(dataHuy3);
            break;

        default:
            break;
    }

    res.json({ message: 'Trade done' });

});

// check coin có trong ví hay không
app.get('/checkCoin', async (req, res) => {
    const { coinName, wallet, type } = req.query;
    const check = async (apiKey, secretKey) => {
        const client = new RestClientV5({
            key: apiKey,
            secret: secretKey,
            testnet: false,
        });

        // Check coin đã có trong ví chưa
        await client
            .getAllCoinsBalance({
                accountType: wallet, //FUND hoặc UNIFIED
                coin: coinName,
            })
            .then((response) => {
                const equity = parseFloat(response.result.balance?.[0]?.transferBalance) // số lượng coin đang có trong ví
                // console.log('RES', response);
                if (equity > 1) {
                    console.log(`Có ${equity} ${coinName} trong ví ${wallet}`);
                    console.log({ apiKey });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
    // loop
    async function processElements(arrData) {
        for (const element of arrData) {
            await check(element.apiKey, element.secretKey);
        }
    }
    switch (type) {
        case '1':
            await processElements(dataHuy1);
            break;
        case '2':
            await processElements(dataHuy2);
            break;
        case '3':
            await processElements(dataHuy3);
            break;

        default:
            break;
    }

    res.json({ message: 'Check done' });

});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
