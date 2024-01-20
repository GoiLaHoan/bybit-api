const { RestClientV5 } = require('bybit-api');
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
// Create an instance of express
const app = express();

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

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
const transferId1 = uuidv4();
const transferId2 = uuidv4();

// Define the POST endpoint
app.get('/trade', async (req, res) => {
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
                priceSell = response.result.b[0][0]; //giá bán gần nhất
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

        // Kiểm tra mỗi 2 giây
        const intervalId = setInterval(async () => {
            await checkAndPlaceOrder();

            // Tăng biến đếm sau mỗi lần lặp
            iterations++;

            // Kiểm tra điều kiện dừng
            if (openOrder.length === 0 || iterations >= maxIterations) {
                clearInterval(intervalId); // Dừng vòng lặp nếu đạt điều kiện
            }
        }, 1000);


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

        // check xem vi unified xem co bao nhieu tien
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

        await client
            .getWithdrawableAmount({
                coin: 'USDT',
            })
            .then((response) => {
                sotiencotherut = response?.result?.withdrawableAmount?.FUND?.withdrawableAmount - 0.3;
            })
            .catch((error) => {
                console.error(error);
            });
        await client
            .submitWithdrawal({
                coin: 'USDT',
                chain: 'BSC',
                address: diachiruttien,
                amount: String(sotiencotherut),
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

        // Return a success response
        res.json({ message: 'Rut thanh cong' });

    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});