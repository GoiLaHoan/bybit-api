const { RestClientV5 } = require('bybit-api');
const express = require('express');
const bodyParser = require('body-parser');

// Create an instance of express
const app = express();

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());


// Define the POST endpoint
app.post('/trade', async (req, res) => {
    const { API_KEY, API_SECRET, coinName } = req.body;
    const symbol = coinName + 'USDT';

    // Initialize RestClientV5 with provided credentials
    const client = new RestClientV5({
        key: API_KEY,
        secret: API_SECRET,
    });

    // Call your trade function here passing the parameters from the request body
    try {
        function convertFloat(inputNumber) {
            let floatNumber = parseFloat(inputNumber);

            // Chuyển số thành chuỗi và tách phần nguyên và phần thập phân
            let parts = floatNumber.toString().split('.');

            // Lấy phần thập phân và giữ lại chỉ 2 số sau dấu thập phân
            let result = parts[0] + '.' + (parts[1] ? parts[1].slice(0, 2) : '00');
            return result
        }
        let priceBuy = '0.01'
        let priceSell = '9999'
        let equityUSDT = null
        let equitySell = null

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
        // Return a success response
        res.json({ message: 'Trade executed successfully' });
    } catch (error) {
        // Return an error response
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Replace these with your actual API Key and API Secret
// const API_KEY = 'yM2HK9R3EJqSSevggs';
// const API_SECRET = 'y8vaft9LTWNVByiSZ0vTeEfngKKiFuZC57do';
// const useTestnet = false;
// const coinName = 'ARB';

// const symbol = coinName + 'USDT';

// const client = new RestClientV5({
//     testnet: useTestnet,
//     key: API_KEY,
//     secret: API_SECRET,
// });

// function convertFloat(inputNumber) {
//     let floatNumber = parseFloat(inputNumber);

//     // Chuyển số thành chuỗi và tách phần nguyên và phần thập phân
//     let parts = floatNumber.toString().split('.');

//     // Lấy phần thập phân và giữ lại chỉ 2 số sau dấu thập phân
//     let result = parts[0] + '.' + (parts[1] ? parts[1].slice(0, 2) : '00');
//     return result
// }

// async function trade(coinName, symbol) {

//     let priceBuy = '0.01'
//     let priceSell = '9999'
//     let equityUSDT = null
//     let equitySell = null

//     // Lấy số dư USDT ví UNIFIED
//     await client
//         .getWalletBalance({
//             accountType: 'UNIFIED',
//             coin: 'USDT',
//         })
//         .then((response) => {
//             const equity = response.result.list[0].coin[0].equity; // số lượng usdt đang có trong ví UNIFIED

//             equityUSDT = String(convertFloat(equity))
//         })
//         .catch((error) => {
//             console.error(error);
//         });


//     // Lấy giá mua và giá bán gần nhất của đồng coin
//     await client
//         .getOrderbook({
//             category: 'spot',
//             symbol,
//         })
//         .then((response) => {
//             priceBuy = response.result.a[0][0]; // giá mua gần nhất
//             priceSell = response.result.b[0][0]; //giá bán gần nhất
//         })
//         .catch((error) => {
//             console.error(error);
//         });


//     // Mua giá gần nhất
//     await client
//         .submitOrder({
//             category: 'spot',
//             symbol,
//             side: 'Buy',
//             orderType: 'Limit',
//             qty: convertFloat(equityUSDT / priceBuy),
//             price: priceBuy,
//         })
//         .then((response) => {
//             console.log(response);
//         })
//         .catch((error) => {
//             console.error(error);
//         });


//     // Check coin đã có trong ví chưa
//     await client
//         .getWalletBalance({
//             accountType: 'UNIFIED',
//             coin: coinName,
//         })
//         .then((response) => {
//             const equity = response.result.list[0].coin[0].equity; // số lượng coin đang có trong ví
//             equitySell = String(convertFloat(equity))
//         })
//         .catch((error) => {
//             console.error(error);
//         });

//     // Bán giá gần nhất
//     await client
//         .submitOrder({
//             category: 'spot',
//             symbol,
//             side: 'Sell',
//             orderType: 'Limit',
//             qty: equitySell, // bán hết
//             price: priceSell,
//         })
//         .then((response) => {
//             console.log(response);
//         })
//         .catch((error) => {
//             console.error(error);
//         });
// }


// trade(coinName, symbol);
