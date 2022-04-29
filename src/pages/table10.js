import React from "react"

import Head from "next/head"

import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

import { db } from "../../Firebase/FirebaseInit"
import { doc, getDoc, updateDoc } from "firebase/firestore";


import { Grid, Card, Modal, Typography, Button } from "@mui/material"

import getStripe from '../../lib/get-stripe';
import Stripe from "stripe";

export default class Table10 extends React.Component { 

    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            orderPrice: 0,
            uid: null
            
        }
        this.redirectToCheckout = this.redirectToCheckout.bind(this)
        this.addOrder = this.addOrder.bind(this)
        this.removeOrder = this.removeOrder.bind(this)
    }

    componentDidMount() {

        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              const uid = user.uid;
              console.log(uid)
              this.setState({uid: uid})

              // ...
            } else {
                signInAnonymously(auth)
                .then(() => {
                    // Signed in..
                    console.log("signed in")
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode)
                    // ...
                });
              // User is signed out
              // ...
            }
          });
        console.log(auth)

    }

    addOrder(orderName, orderPrice) {

        let orders = this.state.orders
        let totalPrice = 0
        let newOrder = true

        orders.forEach((order) => {
            if (order[0] == orderName) {
                order[1] = order[1] + orderPrice
                order[2] = order[2] + 1
                newOrder = false
            }
        })

        if (newOrder) {
            orders.push([orderName, orderPrice, 1])
        }

        orders.forEach((order) => {
            totalPrice = totalPrice + order[1]
        })

        this.setState({
            orders: orders,
            orderPrice: totalPrice
        })



    }

    removeOrder(orderName, orderPrice) {

        let orders = this.state.orders

        orders.forEach((order, index) => {
            if (order[0] == orderName) {
                if (order[2] == 1) {
                    orders.splice(index, 1)
                }
                else {
                    order[2] = order[2] - 1
                    order[1] = order[1] - orderPrice
                }
            }
        })

    
        this.setState({
            orders: orders
        })



    }

    redirectToCheckout = async (job, jobId, clientId) => {

        
        const customerRef = doc(db, "customers", this.state.uid)

        const customerSnap = await getDoc(customerRef)

        let customerId

        if (customerSnap.exists()) {
            await updateDoc(customerRef, {
                location: window.location.pathname
            })
            customerId = customerSnap.data().stripeId
        }

        console.log(customerId)
        
        let orderPrice = 0

        let orders = this.state.orders
        orders.forEach((order) => {
            orderPrice = orderPrice + order[1]
        })
        // Create Stripe checkout
        const response = await fetch('/api/checkout-sessions', {
          method: "POST",
          body: JSON.stringify({
            success_url: window.location.href,
            cancel_url: window.location.href,
            customer: customerId,
            line_items: [{
                  price_data: {
                      currency: "usd",
                      product_data: {
                          name: "Restaurant Order",
                      },
                      unit_amount: orderPrice * 100,
                      tax_behavior: "inclusive",
                  },
                  quantity: 1,
                  
            }],
            payment_method_types: ["card"],
            mode: "payment",
           
          }),
          headers: {
            "Content-Type": "application/json",
          }
            
        });
      
        const session = await response.json()
        console.log(session)
      
      
      
        // Redirect to checkout
        const stripe = await getStripe();
        await stripe.redirectToCheckout({ sessionId: session.id });
      };
     

    render() {

        


        console.log(this.state.uid)
        return (
            <div>
                <Head>
                <title>Restaurant</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Web applications have expanded throughout the development of the internet. Users expect their experience to be fast, reliable, and easy. Bergquist Applications is a suite of libraries, built on the cloud, to deliver on these expectations." />
                <meta name="keywords" content="Progressive Web Development, Modern Development Tools, Database, Styled Components, Authentication, Payment Processing" />

                
                </Head>
                <div>

                    <Typography variant="h2" align="center"> Restaurant Menu </Typography>
                        
                            
                        
                      
                </div>


                {this.state.orders.length > 0 ? 
                <Card style={{backgroundColor: "#E5650F", padding: "5%", margin: "5%", display: "grid"}}>
                <Typography variant="h4" > My Order </Typography>
                {
                this.state.orders.map((order) => {
                    return (
                        <div style={{margin: "5%", padding: "5%", border: "3px solid black"}}>
                            <Typography>
                                {order[0]}
                            </Typography>
                            <Typography>
                                ${order[1]}
                            </Typography>
                            <Typography>
                                {order[2]}
                            </Typography>
                            <Button onClick={() => this.removeOrder(order[0], order[1]/order[2])}>
                                remove
                            </Button>
                        </div>
                    )
                })
                }
                <Typography variant="h4" align="center"> 
                    Order Total ${this.state.orderPrice}
                </Typography>
                <br />
                
                <Button 
                variant="contained" 
                style={{display: "block"}}
                onClick={() => this.redirectToCheckout()}>
                    checkout
                </Button>
                </Card>
                : 
                null
                }
                

                <Card style={{backgroundColor: "#E5650F", padding: "5%", margin: "5%", display: "flex"}}>
                    <Typography variant="h4" > Pizza </Typography>
                    <Grid container>
                        <Grid item xs={12} sm={4}>
                        <Button 
                        style={{display: "block"}}
                        onClick={() => this.addOrder("small pizza", 10)}
                        >
                        <Typography style={{padding: 30}}>
                            Small
                        </Typography>
                            
                        <Typography>
                            $10.00
                        </Typography>
                        </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                        <Button 
                        style={{display: "block"}}
                        onClick={() => this.addOrder("medium pizza", 15)}
                        >
                        <Typography style={{padding: 30}}>
                            Medium
                        </Typography>
                        <Typography>
                            $15.00
                        </Typography>
                        </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                        <Button 
                        style={{display: "block"}}
                        onClick={() => this.addOrder("large pizza", 20)}
                        >
                        <Typography style={{padding: 30}}>
                            Large
                        </Typography>
                        <Typography>
                            $20.00
                        </Typography>
                        </Button>
                        </Grid>

                    </Grid>
                    
                    
                    
                    
                </Card>
                    
                

                
            </div>
        )
    }
    
}

export const getStaticProps = async () =>  {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2020-08-27",
    });
  
    const prices = await stripe.prices.list({
      active: true,
      limit: 10,
      expand: ["data.product"],
    });
        
  return { props: {products: prices.data.reverse()}}
  }