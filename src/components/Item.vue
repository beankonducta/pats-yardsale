<template>
  <div>
    <div v-if="loading">loading..</div>
    <div class="item" :style="{ backgroundColor: calcBgColor }">
      <p class="sold" v-if="item.quantity < 1">SOLD</p>
      <p class="fake" v-if="item.fake">** PRICE REFLECTS AUTHENTICITY **</p>
      <h1 :ref="item.name" :class="item.quantity < 1 ? 'title-sold' : ''">{{ item.name }}</h1>
      <p :class="item.quantity < 1 ? 'title-sold' : ''">size: {{ item.size }}</p>
      <p :class="item.quantity < 1 ? 'title-sold' : ''">condition: {{ item.condition }}</p>
      <img v-if="item.image" :class="item.quantity < 1 ? 'img-sold' : ''" :src="item.image" />
      <img v-if="item.image2" :class="item.quantity < 1 ? 'img-sold' : ''" :src="item.image2" />
      <img v-if="item.image3" :class="item.quantity < 1 ? 'img-sold' : ''" :src="item.image3" />
      <p :class="item.quantity < 1 ? 'title-sold' : ''">{{ item.description }}</p>
      <div v-if="item.quantity > 0 && validItemPrice(item.price)" :id="id"></div>
      <div v-if="item.quantity > 0 && !validItemPrice(item.price)">
        <a :href="`mailto:patrick@bluecopperslc.com?subject=price request for ${item.name}`">contact for price</a>
      </div>

      <p v-if="validItemPrice(item.price) && item.price === item.salePrice"
        :class="item.quantity < 1 ? 'title-sold' : ''">${{ item.price }}</p>
        <p v-if="validItemPrice(item.price) && item.quantity > 0"
        :class="item.quantity < 1 ? 'title-sold' : ''"><a :href="`mailto:patrick@bluecopperslc.com?subject=question about ${item.name}`">offer / inquire</a></p>
      <p v-if="validItemPrice(item.price) && item.price !== item.salePrice"
        :class="item.quantity < 1 ? 'title-sold strikethru' : 'strikethru'">${{ item.price }}</p>
      <p class="shake-lr" v-if="validItemPrice(item.salePrice) && item.price !== item.salePrice"
        :class="item.quantity < 1 ? 'title-sold' : 'sale-price'">SALE: ${{ item.salePrice }}</p>
        
    </div>
  </div>
</template>

<script>
require('dotenv').config()
export default {
  name: 'Item',
  props: {
    item: {
      type: Object,
      required: true
    },
    id: String,
    paypal: Object,
    scrollY: Number,
  },
  data() {
    return {
      yPos: 0,
      loading: true
    }
  },
  methods: {
    validItemPrice(price) {
      if (+price.split('.')[0] < 1000)
        return true
      return false
    }
  },
  updated() {
    this.yPos =
      this.$refs[this.item.name].getBoundingClientRect().y +
      document.documentElement.scrollTop;
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 2000)
    this.yPos =
      this.$refs[this.item.name].getBoundingClientRect().y +
      document.documentElement.scrollTop;
    if (this.item.quantity > 0 && this.paypal && this.validItemPrice(this.item.price)) {
      const self = this;
      this.paypal
        .Buttons({
          style: {
            color: "blue",
          },
          environment: "production",
          fundingSource: self.paypal.FUNDING.PAYPAL,
          createOrder: function (data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details.
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: self.item.salePrice // Replace this with the price you want to set for the transaction.
                }
              }]
            });
          },
          onApprove: function (data, actions) {
            // This function captures the funds from the transaction.
            return actions.order.capture().then(function () {
              self.$emit('sellItem', self.item)
            });
          }
        })
        .render(`#${this.id}`)
        .catch((error) => {
          console.error("failed to render the PayPal Buttons", error);
        });
    }
  },
  computed: {
    yOffset() {
      return this.scrollY - this.yPos;
    },
    calcBgColor() {
      return `rgb(143, ${210 - (this.yOffset / 8)}, 143)`
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@font-face {
  font-family: "VioletSans";
  src: url("../assets/fonts/WOFF/VioletSans-Regular.woff") format("woff"),
    url("../assets/fonts/WOFF2/VioletSans-Regular.woff2") format("woff2"),
}

* {
  box-sizing: border-box;
  font-family: 'VioletSans', monospace;
  text-transform: lowercase;
}

.item {
  text-align: center;
  width: 30%;
  min-width: 300px;
  margin: 0 auto;
  padding: 1%;
  background-color: rgb(143, 210, 143);
  margin-bottom: 20%;
  border-radius: 1px;
  position: relative;
  animation: fadeInAnimation ease 3s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

.sold {
  color: red;
  position: absolute;
  top: 20%;
  font-size: 7rem;
  transform: rotate(-45deg);
  z-index: 999;
}

.fake {
  color: red;
}

.sale-price {
  color: red;
}

.img-sold {
  opacity: 0.5;
}

.title-sold {
  text-decoration: line-through;
  opacity: 0.5;
}

.strikethru {
  text-decoration: line-through;
}

h1 {
  font-size: 2rem;
}

p {
  font-size: 1.5rem;
  padding: 0;
  margin: 1%;
}

a {
  font-size: 1.5rem;
  color: #42b983;
}

img {
  width: 80%;
  margin-top: 1%;
  border-radius: 1px;
  padding-left: 10%;
  padding-right: 10%;
}

@keyframes fadeInAnimation {
  0% {
    opacity: 0;
  }

  70% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.shake-lr {
  -webkit-animation: shake-lr 3s linear infinite both;
  animation: shake-lr 3s linear infinite both;
}

@-webkit-keyframes shake-lr {

  0%,
  100% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }

  10% {
    -webkit-transform: rotate(8deg);
    transform: rotate(8deg);
  }

  20%,
  40%,
  60% {
    -webkit-transform: rotate(-10deg);
    transform: rotate(-10deg);
  }

  30%,
  50%,
  70% {
    -webkit-transform: rotate(10deg);
    transform: rotate(10deg);
  }

  80% {
    -webkit-transform: rotate(-8deg);
    transform: rotate(-8deg);
  }

  90% {
    -webkit-transform: rotate(8deg);
    transform: rotate(8deg);
  }
}

@keyframes shake-lr {

  0%,
  100% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }

  10% {
    -webkit-transform: rotate(8deg);
    transform: rotate(8deg);
  }

  20%,
  40%,
  60% {
    -webkit-transform: rotate(-10deg);
    transform: rotate(-10deg);
  }

  30%,
  50%,
  70% {
    -webkit-transform: rotate(10deg);
    transform: rotate(10deg);
  }

  80% {
    -webkit-transform: rotate(-8deg);
    transform: rotate(-8deg);
  }

  90% {
    -webkit-transform: rotate(8deg);
    transform: rotate(8deg);
  }
}
</style>
