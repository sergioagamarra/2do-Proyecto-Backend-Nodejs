const stripe = Stripe("pk_test_51LAnU3KhvPIxNp07wTAyjyQQYRhYElqWTIwuDH4EDCstGslGabnw0fvqj7IQ4QJwmqbfffw6iM6eKLhnZsfXHCgM00s9nSc9Wn");

const form = document.getElementById("payment-form")
const loadPaymentBtn = document.getElementById("loadPayment")


loadPaymentBtn.onclick = ()=>{
    initialize()
}

let elements;

const initialize = async () => {
    const response = await fetch("http://localhost:4000/api/carts/pay-stripe", {
        credentials: "include"
    })

    const data = await response.json()

    const clientSecret = data.clientSecret

    const appearance = {
        theme: 'stripe',
    };

    elements = stripe.elements({ appearance, clientSecret });

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");
}

form.onsubmit= async (event) => {
    alert("enviando")
    event.preventDefault()
    const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
    })
    if(result.paymentIntent?.status==="succeeded"){
        // fetch("http://localhost:4000/api/cart/paymentCompleted",{
        //     method:"POST",
        //     credentials:"include"
        // }).then(resp=>resp.json())
        // .then(console.log)
        // .catch(console.log)
    }

    console.log(result)
}

console.log(form);