const functions = require("firebase-functions");

const fbApp = require('firebase/app')
const fbDb = require('firebase/database')

const { initializeApp } = fbApp
const { getDatabase, ref, update, get, set } = fbDb

require('dotenv').config()
const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: "clothes-620dd.firebaseapp.com",
    databaseURL: "https://clothes-620dd-default-rtdb.firebaseio.com",
    projectId: "clothes-620dd",
    storageBucket: "clothes-620dd.appspot.com",
    messagingSenderId: "268329079517",
    appId: "1:268329079517:web:e7812fdfd81847d8ebc134"
};
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const itemsRef = ref(db, '/items')

exports.decreasePrice = functions.https.onRequest(async (req, res) => {
    const snapshot = await get(itemsRef)
    const items = snapshot.val()
    const newItems = Object.keys(items).map(key => {
        let oldPrice = items[key].salePrice.split('.')[0]
        let minPrice = items[key].minPrice.split('.')[0]
        let newPrice = oldPrice;
        if (oldPrice - 1 >= minPrice)
            newPrice = oldPrice - 1
        return {
            ...items[key],
            salePrice: `${newPrice}.00`
        }
    })
    await set(itemsRef, newItems)
    res.send('okay!')
});