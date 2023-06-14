<template>
  <div id="app">
    <!-- <div class="hand">
      <img src="./assets/hand.png" />
    </div> -->
    <header class="header">
      <div class="header-sub-container">
        <h1 class="header-text">welcome to pat's yardsale</h1>
        <h2 class="header-sub">slc locals only. all sales final. offers welcome. i'll get in touch after you buy something
          and arrange pickup. if you have any
          questions or want more pics please <a href="mailto:patrick@bluecopperslc.com">email.</a></h2>
        <h2 class="header-sub underlined">prices automatically drop by $1 per day, until they hit a floor price.</h2>
        <h2 class="header-sub underlined">pardon the wrinkles, shit has been in my closet forever.</h2>
      </div>
    </header>
    <Item v-for="(item, index) in items" :key="index" :item="item" :id="`item-${index}`" :paypal="paypal"
      @sellItem="sellItem($event)" :scrollY="scrollY" />
    <div v-if="items.length === 0" class="empty-items"> No items :(</div>
  </div>
</template>

<script>
import Item from './components/Item.vue';
import { loadScript } from "@paypal/paypal-js";
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, push, set, update } from 'firebase/database'
import { getAnalytics, logEvent } from "firebase/analytics";
require('dotenv').config()
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: "clothes-620dd.firebaseapp.com",
  databaseURL: "https://clothes-620dd-default-rtdb.firebaseio.com",
  projectId: "clothes-620dd",
  storageBucket: "clothes-620dd.appspot.com",
  messagingSenderId: "268329079517",
  appId: "1:268329079517:web:e7812fdfd81847d8ebc134",
  measurementId: "G-RGTJ5JZCLQ"
};
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);
const db = getDatabase(app)
const itemsRef = ref(db, '/items')
export default {
  name: 'App',
  components: {
    Item
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  data() {
    return {
      items: [],
      paypal: null,
      upload: false,
      scrollY
    }
  },
  methods: {
    handleScroll(event) {
      this.scrollY = event.currentTarget.scrollY
    },
    getItems() {
      console.log("fetching items")
      onValue(itemsRef, (snapshot) => {
        console.log('snapshot', snapshot)
        this.items = []
        snapshot.forEach((childSnapshot) => {
          this.items.push({ ...childSnapshot.val(), id: childSnapshot.key })
        })
      })
    },
    addItem(item) {
      const newItemRef = push(itemsRef)
      set(newItemRef, item)
    },
    sellItem(item) {
      console.log("selling item")
      const itemRef = ref(db, `/items/${item.id}`)
      update(itemRef, {
        ...item,
        quantity: item.quantity - 1,
      })
    },
    decreaseItemPrice(item) {
      const itemRef = ref(db, `/items/${item.id}`)
      const oldPrice = item.salePrice.split('.')[0]
      const minPrice = item.minPrice.split('.')[0]
      let newPrice = oldPrice;
      if (oldPrice - 1 >= minPrice)
        newPrice = oldPrice - 1
      update(itemRef, {
        ...item,
        salePrice: `${newPrice}.00`
      })
    }
  },
  mounted() {
    logEvent(analytics, 'page visited');
    loadScript({ clientId: process.env.VUE_APP_PAYPAL_CLIENT_ID })
      .then((paypal) => {
        this.getItems();
        this.paypal = paypal;
      })
      .catch((error) => {
        console.error("failed to load the PayPal JS SDK script", error);
      });
    if (this.upload) {
      this.addItem({
        name: '',
        price: '00.00',
        minPrice: '00.00',
        salePrice: '00.00',
        description: '',
        size: "",
        condition: '',
        quantity: 0,
        category: '',
        image:
          '',
        image2: '',
        image3: ''
      })
    }
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #010b15;
  margin-top: 60px;
  text-align: center;
}

* {
  box-sizing: border-box;
  font-family: 'VioletSans', monospace;
  text-transform: lowercase;
}

body {
  background-color: lightgreen;
}

.header {
  width: 100%;
  margin: 0 auto;
}

.header-sub-container {
  width: 60%;
  margin: 0 auto;
  min-width: 300px;
}

.header-sub {
  text-align: justify;
}

.header-sub:after {
  content: "";
  display: inline-block;
  width: 100%;
}

.header-text {
  font-size: 4rem;
  text-align: justify;
}

.header-text:after {
  content: "";
  display: inline-block;
  width: 100%;
}

.underlined {
  text-decoration: underline;
}

.hand {
  position: fixed;
  top: 0;
  left: 25%;
}

.hand img {
  width: 20%;
}

.empty-items {
  color: red;
}
</style>
