import React from "react"

import Head from "next/head"

import { db } from "../../Firebase/FirebaseInit"
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"


import { Grid, Card, Modal, Typography, Button } from "@mui/material"

export default class Index extends React.Component { 

    constructor(props) {
        super(props)
        this.state = {
            
        }
        this.completeOrder = this.completeOrder.bind(this)
    }

    componentDidMount() {
        
        const customerRef = collection(db, "customers")

        this.unsub = onSnapshot(customerRef, (customerQuery) => {
            this.setState({})
            customerQuery.forEach((customer) => {
                const orderRef = collection(db, "customers", customer.id, "payments")
                this.unsub2 = onSnapshot(orderRef, (orderQuery) => {
                    orderQuery.forEach((order) => {
                        this.setState({
                            [order.id]: [customer.data(), order.data(), customer.id]
                        })
                    })

                })
            })
        })

    }

    componentWillUnmount() {
        this.unsub()
        this.unsub2()
    }

    async completeOrder(customerId, orderId) {
        
        const orderRef = doc(db, "customers", customerId, "payments", orderId)

        await updateDoc(orderRef, {
            completed: true
        })

    }
     

    render() {

        console.log(Object.entries(this.state))


        return (
            <div>
                <Head>
                <title>Restaurant</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Web applications have expanded throughout the development of the internet. Users expect their experience to be fast, reliable, and easy. Bergquist Applications is a suite of libraries, built on the cloud, to deliver on these expectations." />
                <meta name="keywords" content="Progressive Web Development, Modern Development Tools, Database, Styled Components, Authentication, Payment Processing" />

                
                </Head>
                <div>

                    <Typography variant="h2" align="center"> Orders </Typography>
                        
                            
                        
                      
                </div>

                {Object.entries(this.state).length > 0 ?
                Object.entries(this.state).map((order, index) => {
                    console.log(order)
                    return (
                        <Card key={index} style={{display: "flex", backgroundColor: order[1][1].completed ? "#7EA900" : "#E5650F", margin: "5%"}}>
                            <Typography style={{padding: "5%"}}>
                                {order[1][1].customer}
                            </Typography>
                            <Typography style={{padding: "5%"}}>
                                {"$" + (order[1][1].amount/100).toFixed(2)}
                            </Typography>
                            <Typography style={{padding: "5%"}}>
                                {Array.from(order[1][0].location).splice(1)}
                            </Typography>
                            <Button 
                                variant="outlined"
                                style={{margin: "5%"}}
                                onClick={() => this.completeOrder(order[1][2], order[0])}
                            > 
                            Complete 
                            </Button>
                            
                            
                        </Card>
                    )
                })
                :
                null
                }

                
                    
                

                
            </div>
        )
    }
    
}