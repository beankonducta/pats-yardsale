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
    // this.addItem({
    //   name: 'itm1',
    //   price: '1.00',
    //   description: 'worn once, fits 8.5 snug',
    //   size: 8.5,
    //   condition: '9/10',
    //   quantity: 1,
    //   image: 'https://imageio.forbes.com/specials-images/imageserve/5d35eacaf1176b0008974b54/2020-Chevrolet-Corvette-Stingray/0x0.jpg?format=jpg&crop=4560,2565,x790,y784,safe&width=960'
    // }),
    // this.addItem({
    //   name: 'itm2',
    //   fake: true,
    //   price: '2.00',
    //   description: 'worn once, fits 8.5 snug',
    //   size: 8.5,
    //   condition: '9/10',
    //   quantity: 1,
    //   image: 'https://imageio.forbes.com/specials-images/imageserve/5d35eacaf1176b0008974b54/2020-Chevrolet-Corvette-Stingray/0x0.jpg?format=jpg&crop=4560,2565,x790,y784,safe&width=960'
    // })
    if (this.upload) {
      this.addItem({
        name: 'superdry winter coat',
        price: '35.00',
        minPrice: '20.00',
        salePrice: '35.00',
        description: 'worn a good bit. super warm. some marks / stains that would clean off. looks good on medium or large.',
        size: "large",
        condition: '7.5/10',
        quantity: 1,
        category: 'clothes',
        image:
          'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/superdry_0-min.png?alt=media&token=94fdf595-6f8e-4cb6-89fe-dc6c9c20d3b6',
        image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/superdry_1-min.png?alt=media&token=e117ce20-b443-4fbf-a894-ca0f5ce0cdc8'
      }),
        this.addItem({
          name: 'pleasures polo',
          price: '40.00',
          minPrice: '20.00',
          salePrice: '40.00',
          description: 'worn a few times. fits small to medium.',
          size: "small",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/pleasures_polo_0-min.png?alt=media&token=0d560a7e-f85c-49e0-8c00-2bd084c7e643',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/pleasures_polo_1-min.png?alt=media&token=c93cbdf2-ef53-4745-90d2-78bc110e9fe1'
        }),
        this.addItem({
          name: 'richardson x public housing skate team hoodie',
          price: '100.00',
          minPrice: '50.00',
          salePrice: '100.00',
          description: 'worn once, not for me. so sick though. fits a little big',
          size: "medium",
          condition: '10/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/richardson_0-min.png?alt=media&token=9b77a10d-ffb9-4236-b991-01e8293a1905',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/richardson_1-min.png?alt=media&token=77d09864-6133-487f-9dcd-746db660157a'
        }),
        this.addItem({
          name: 'claudie pierlot goldy puffer',
          price: '200.00',
          minPrice: '100.00',
          salePrice: '200.00',
          description: 'so sick. fits mens xl, long. worn a handful of times. still has tags. looks good on anyone.',
          size: "36",
          condition: '9/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/goldy_0-min.png?alt=media&token=9dd8096a-9279-4c5b-8710-8b6e066113c1',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/goldy_1-min.png?alt=media&token=7e3a864e-c448-480d-bb88-e58449013ecc'
        }),
        this.addItem({
          name: 'adidas chile62 vintage track jacket',
          price: '30.00',
          minPrice: '10.00',
          salePrice: '30.00',
          description: 'very cool. fits true to size',
          size: "medium",
          condition: '8/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/chile_0-min.png?alt=media&token=262815e3-9071-4c52-8efa-221a59a6dc28',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/chile_1-min.png?alt=media&token=8992cf63-b182-4d35-bf7d-ecab76d59b42'
        }),
        this.addItem({
          name: 'pleasures jesus loser polo',
          price: '40.00',
          minPrice: '20.00',
          salePrice: '40.00',
          description: 'fits medium to tight large. worn a few times',
          size: "medium",
          condition: '9/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/loser_0-min.png?alt=media&token=c3066386-91fd-4106-9d22-7eeafdaf34c0',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/loser_1-min.png?alt=media&token=99609552-7fd2-4c27-b38d-b712f0e30fa4'
        }),
        this.addItem({
          name: 'nike cortez x kendrick lamar house shoes',
          price: '75.00',
          minPrice: '50.00',
          salePrice: '75.00',
          description: 'worn a couple times, fits true to size. no box or accessories',
          size: "8",
          condition: '9/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/kendrick_cortez_0-min.png?alt=media&token=e0d59fe4-81a5-46f8-b1ba-d83c73b05bdf',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/kendrick_cortez_1-min.png?alt=media&token=abbfa86b-5b9e-421d-a426-ed571170003f'
        }),
        this.addItem({
          name: 'nike aj4 retro x travis scott',
          price: '500.00',
          minPrice: '450.00',
          salePrice: '500.00',
          description: 'worn a few times, fits true to size. no box or accessories. some marks on shoes, please ask for more pics',
          size: "8",
          condition: '9/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/ts_aj4_0-min.png?alt=media&token=7bb82bb0-b218-4d0f-a532-95ae3ba998a1',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/ts_aj4_1-min.png?alt=media&token=6d99536e-e58b-4105-a551-147637f3b0eb'
        }),
        this.addItem({
          name: 'atcq x vans sk8 hi',
          price: '75.00',
          minPrice: '50.00',
          salePrice: '75.00',
          description: 'worn a few times, fits true to size. no box or accessories. some marks on shoes, please ask for more pics',
          size: "8.5",
          condition: '8.5/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/atcq_1.png?alt=media&token=f51b89ad-b4dd-4c96-9cfc-89e38081e5cc',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/atcq_0.png?alt=media&token=ec8fe4dc-b81d-4ff8-82e7-a64c930b1b0f'
        }),
        this.addItem({
          name: 'rare blue copper please enjoy pink shirt',
          price: '40.00',
          minPrice: '20.00',
          salePrice: '40.00',
          description: 'worn a few times, fits slim. super rare!',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/bc_pink_0.png?alt=media&token=74452c85-81ad-4a24-8c7d-60050d0fcca9'
        }),
        this.addItem({
          name: 'rare blue copper soccer shirt',
          price: '40.00',
          minPrice: '20.00',
          salePrice: '40.00',
          description: 'worn a bunch. front emblem is wearing out. still sick!',
          size: "medium",
          condition: '7/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/bc_soccer_0.png?alt=media&token=839af92b-809a-45d2-9a0c-89fa43e966b5',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/bc_soccer_1.png?alt=media&token=6aba41b4-7257-4a91-8e11-0333acda8d8c'
        }),
        this.addItem({
          name: 'indigo (brand) sweater with yorkies on it',
          price: '30.00',
          minPrice: '15.00',
          salePrice: '30.00',
          description: 'worn a couple times. very cozy. fits a touch baggy',
          size: "medium",
          condition: '8/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/bw_0.png?alt=media&token=582a1a6e-89f3-4fb3-9a5f-e5019460076d',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/bw_1.png?alt=media&token=68899b8f-40a0-4310-a158-486402c6091e'
        }),
        this.addItem({
          name: 'chinatown market cool print hoodie',
          price: '80.00',
          minPrice: '50.00',
          salePrice: '80.00',
          description: 'worn a couple times. fits true to size. really cool design.',
          size: "medium",
          condition: '9/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/chinatown_hoodie_0.png?alt=media&token=73cedc44-efd7-4000-9ae9-677195c016f9',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/chinatown_hoodie_1.png?alt=media&token=70aef939-41f1-4e5e-8351-b640f6d353e3'
        }),
        this.addItem({
          name: 'chinatown market master of turnips shirt',
          price: '45.00',
          minPrice: '30.00',
          salePrice: '45.00',
          description: 'worn a bit. fits a touch boxy.',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/turnips_0.png?alt=media&token=834be03f-b793-4c4a-816b-64aa093da631'
        }),
        this.addItem({
          name: 'chinatown market tom nook shirt',
          price: '45.00',
          minPrice: '30.00',
          salePrice: '45.00',
          description: 'worn a bit. fits a touch boxy.',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/tomnook_0.png?alt=media&token=906e91d2-540d-4945-84da-9599b5e83718'
        }),
        this.addItem({
          name: 'schoolboy q crash talk hoodie',
          price: '60.00',
          minPrice: '40.00',
          salePrice: '60.00',
          description: 'worn a couple times. fits true to size. cozy.',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/schoolboy_0.png?alt=media&token=2ae709e0-5cd1-447e-b4e0-1cb3172df047',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/schoolboy_1.png?alt=media&token=a165c8a7-71df-4d88-bb01-124a739a9697'
        }),
        this.addItem({
          name: 'converge blood moon shirt - blue front',
          price: '30.00',
          minPrice: '15.00',
          salePrice: '30.00',
          description: 'worn a couple times. fits a touch boxy.',
          size: "medium",
          condition: '9/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/converge_0_0.png?alt=media&token=2be9b871-dd1b-450a-970f-fe16dc453e51',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/converge_0_1.png?alt=media&token=54b2ec0b-a867-48c4-ab70-36d37d037727'
        }),
        this.addItem({
          name: 'converge blood moon shirt - red front',
          price: '30.00',
          minPrice: '15.00',
          salePrice: '30.00',
          description: 'worn a couple times. fits a touch boxy.',
          size: "medium",
          condition: '9/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/converge_1_0.png?alt=media&token=34f9fdf4-67e2-4771-a326-1938bb99fd9e',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/converge_1_1.png?alt=media&token=7584f344-3b60-407a-9c13-879dc3c001f9'
        }),
        this.addItem({
          name: 'cumtown essential worker shirt',
          price: '30.00',
          minPrice: '15.00',
          salePrice: '30.00',
          description: 'worn a couple times. fits slim(ish)',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/cumtown_0.png?alt=media&token=433fa093-603c-43f0-b0dc-31eae904dc1c'
        }),
        this.addItem({
          name: 'best brand hermes shirt',
          price: '30.00',
          minPrice: '20.00',
          salePrice: '30.00',
          description: 'worn a couple times. fits kinda boxy.',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/hermes_0.png?alt=media&token=be0f8aad-0b77-432a-9419-78870dc0bec1'
        }),
        this.addItem({
          name: 'igor shirt pink',
          price: '60.00',
          minPrice: '40.00',
          salePrice: '60.00',
          description: 'worn a couple times. fits true to size.',
          size: "medium",
          condition: '8.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/igor_).png?alt=media&token=a792d62d-7b4f-4af7-9b37-9ce3a4440c65'
        }),
        this.addItem({
          name: 'golf le fleur x converse pink',
          price: '75.00',
          minPrice: '60.00',
          salePrice: '75.00',
          description: 'worn a bunch. fits 8m/10w. comes with the burlap bag. some stains.',
          size: "7.5",
          condition: '7.5/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/golf_pink_0.png?alt=media&token=818468bd-ebe9-423b-8a68-09ad71fbb54e',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/golf_pink_1.png?alt=media&token=874f4945-a2c3-4934-a781-f73059f5e4ac'
        }),
        this.addItem({
          name: 'golf le fleur x converse red',
          price: '75.00',
          minPrice: '60.00',
          salePrice: '75.00',
          description: 'worn a bunch. fits 8m/10w. comes with the burlap bag. laces have some staining.',
          size: "7.5",
          condition: '7.5/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/golf_red_0.png?alt=media&token=80f33620-e49f-4d05-a2bd-118bca021a2c',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/golf_red_1.png?alt=media&token=11e84498-3d43-428c-8331-dff92eabf5ba'
        }),
        this.addItem({
          name: 'fear of god x nike moc grey',
          price: '75.00',
          minPrice: '50.00',
          salePrice: '75.00',
          description: 'worn a couple times. fits true to size. really great condition other than a couple stains.',
          size: "8",
          condition: '8.5/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/fog_grey_0.png?alt=media&token=4429ac90-42b8-4b1c-9a0c-3e16cd1cf1e7',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/fog_grey_1.png?alt=media&token=8d6be43c-8eaf-4e7f-8579-8d4f5d647537'
        }),
        this.addItem({
          name: 'fear of god x nike moc black',
          price: '80.00',
          minPrice: '50.00',
          salePrice: '80.00',
          description: 'worn a couple times. fits true to size. really great condition.',
          size: "8",
          condition: '9/10',
          quantity: 1,
          category: 'shoes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/fog_black_0.png?alt=media&token=a628cfd2-1814-4a07-a605-521b6e68e708',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/fog_black_1.png?alt=media&token=0eece397-5678-4d8c-b888-20a0d5709688'
        }),
        this.addItem({
          name: 'fluffy zipup sweater thing',
          price: '20.00',
          minPrice: '10.00',
          salePrice: '20.00',
          description: 'really cool! makes you look like a goldendoodle.',
          size: "s",
          condition: '8/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/fluffy_0.png?alt=media&token=cd8faf80-5715-492e-82e6-1268c127308e',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/fluffy_1.png?alt=media&token=a7047754-5422-49a9-b6a3-bcd50cf5feea'
        }),
        this.addItem({
          name: 'post malone goodbyes shirt',
          price: '20.00',
          minPrice: '10.00',
          salePrice: '20.00',
          description: 'good condition other than a lil coffee stain. fits true to size. graphic is faded.',
          size: "m",
          condition: '7.5/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/posty_0.png?alt=media&token=fbd7fe12-9766-4d6e-94e9-cd909dd1337c'
        }),
        this.addItem({
          name: 'kiefer happy sad shirt',
          price: '20.00',
          minPrice: '10.00',
          salePrice: '20.00',
          description: 'fits slim. good condition.',
          size: "m",
          condition: '8/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/kiefer_0.png?alt=media&token=d0f94e33-968a-4839-a015-b5460e090991',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/kiefer_1.png?alt=media&token=fd0061a1-e973-463e-b40f-b66f1b8f02fa'
        }),
        this.addItem({
          name: 'levis denim jacket distressed',
          price: '50.00',
          minPrice: '30.00',
          salePrice: '50.00',
          description: 'fits true to size. slightly boxy.',
          size: "m",
          condition: '8/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/levis_0.png?alt=media&token=b0c77d38-ac2c-499b-8661-5eede131f917',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/levis_1.png?alt=media&token=174a039b-24b1-4e36-b618-4d98896ff341'
        }),
        this.addItem({
          name: 'palace fleece jacket',
          fake: true,
          price: '20.00',
          minPrice: '5.00',
          salePrice: '20.00',
          description: 'kinda shit tier quality. still looks cool.',
          size: "m",
          condition: '6/10',
          quantity: 1,
          category: 'clothes',
          image:
            'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/palace_0.png?alt=media&token=62845d6d-3052-44af-97d3-40f2deb5d87e',
          image2: 'https://firebasestorage.googleapis.com/v0/b/clothes-620dd.appspot.com/o/palace_1.png?alt=media&token=5d0dc871-f119-49c8-bc8e-b92909b21032'
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
