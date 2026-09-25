import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./payment";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

<Elements stripe={stripePromise}>
  <PaymentForm paymentIntent={paymentIntent} />
</Elements>
