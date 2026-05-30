import React from 'react';
import PolicyLayout from '../components/PolicyLayout';

const ShippingPolicy = () => {
  return (
    <PolicyLayout title="Shipping & Delivery Policy" lastUpdated="December 17, 2025">
      
      <div className="policy-section">
        <h2>Overview</h2>
        <p>
          At NutriJewel, we are committed to delivering your orders in a timely and secure manner. All our products 
          are made fresh to order, ensuring you receive the highest quality handcrafted nutritious snacks.
        </p>
      </div>

      <div className="policy-section">
        <h2>Order Processing Time</h2>
        <div className="policy-highlight">
          <strong>Processing Time:</strong> Orders are processed and shipped within <strong>7 days</strong> from the 
          date of order confirmation and/or payment, or as per the delivery date agreed at the time of order confirmation.
        </div>
        <p>
          Since all our products are made fresh to order without preservatives, we require adequate time to prepare 
          your items with care and attention to quality. The 7-day processing period ensures that you receive the 
          freshest possible products.
        </p>
      </div>

      <div className="policy-section">
        <h2>Shipping Partners</h2>
        <p>
          Orders are shipped through registered domestic courier companies and/or speed post only. We partner with 
          reliable courier services to ensure safe and secure delivery of your products.
        </p>
      </div>

      <div className="policy-section">
        <h2>Delivery Timeline</h2>
        <p>
          The delivery timeline depends on the courier company/postal authority and the destination location. 
          While we make every effort to ensure timely delivery, the actual delivery time may vary based on:
        </p>
        <ul>
          <li>Location and accessibility of the delivery address</li>
          <li>Courier company operations and schedules</li>
          <li>Weather conditions and unforeseen circumstances</li>
          <li>Public holidays and regional festivals</li>
        </ul>
        <p>
          <strong>Platform Owner shall not be liable for any delay in delivery by the courier company/postal authority.</strong>
        </p>
      </div>

      <div className="policy-section">
        <h2>Delivery Address</h2>
        <p>
          Delivery of all orders will be made to the address provided by the buyer at the time of purchase. 
          Please ensure that:
        </p>
        <ul>
          <li>The delivery address is complete and accurate</li>
          <li>The contact number provided is reachable</li>
          <li>Someone is available at the address to receive the delivery</li>
          <li>The address includes landmark details for easy location</li>
        </ul>
        <p>
          Delivery confirmation will be sent to your registered email ID and/or mobile number.
        </p>
      </div>

      <div className="policy-section">
        <h2>Shipping Charges</h2>
        <p>
          Shipping costs (if applicable) will be displayed at the time of checkout. These charges are calculated 
          based on the delivery location and order weight.
        </p>
        <div className="policy-highlight">
          <strong>Important:</strong> If there are any shipping cost(s) levied by the seller or the Platform Owner 
          (as the case be), the same is not refundable.
        </div>
      </div>

      <div className="policy-section">
        <h2>Order Tracking</h2>
        <p>
          Once your order is dispatched, you will receive a tracking number via email/SMS. You can use this tracking 
          number to monitor your shipment's progress on the courier company's website.
        </p>
      </div>

      <div className="policy-section">
        <h2>Special Handling for Perishable Items</h2>
        <p>
          Our products include cakes, traditional sweets, and other perishable food items. We take special care in 
          packaging to ensure:
        </p>
        <ul>
          <li>Products remain fresh during transit</li>
          <li>Secure packaging to prevent damage</li>
          <li>Temperature-appropriate packaging materials</li>
          <li>Protection from external contamination</li>
        </ul>
        <p>
          <strong>Note:</strong> Due to the perishable nature of our products, please ensure someone is available 
          to receive the delivery. We recommend consuming the products as soon as possible after delivery for best 
          taste and quality.
        </p>
      </div>

      <div className="policy-section">
        <h2>Delivery Issues</h2>
        <p>
          In case of any delivery-related issues such as:
        </p>
        <ul>
          <li>Non-delivery of order</li>
          <li>Damaged package received</li>
          <li>Incorrect items delivered</li>
          <li>Missing items from the order</li>
        </ul>
        <p>
          Please contact us immediately at the details provided below. We request you to:
        </p>
        <ul>
          <li>Report the issue within 24-48 hours of delivery</li>
          <li>Provide photographs of the damaged/incorrect items</li>
          <li>Share the order number and tracking details</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>Failed Delivery Attempts</h2>
        <p>
          If the courier company is unable to deliver your order due to:
        </p>
        <ul>
          <li>Incorrect or incomplete address</li>
          <li>Recipient unavailable</li>
          <li>Refusal to accept delivery</li>
        </ul>
        <p>
          The courier will make 2-3 delivery attempts. If all attempts fail, the order will be returned to us. 
          In such cases, you may be required to pay for re-shipment or the order may be cancelled as per our 
          refund policy.
        </p>
      </div>

      <div className="policy-section">
        <h2>Unserviceable Areas</h2>
        <p>
          We currently deliver across India through our courier partners. However, some remote locations may not 
          be serviceable. In such cases, we will inform you at the time of order confirmation and provide alternative 
          solutions if available.
        </p>
      </div>

      <div className="policy-contact">
        <h3>Shipping Queries?</h3>
        <p>For any questions or concerns about your shipment, please contact us:</p>
        <p>📞 <strong>Phone:</strong> <a href="tel:+919960637656">+91 996-063-7656</a></p>
        <p>📧 <strong>Email:</strong> <a href="mailto:hello@nutrijewel.com">hello@nutrijewel.com</a></p>
        <p>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/919960637656">Chat with us</a></p>
        <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
      </div>

    </PolicyLayout>
  );
};

export default ShippingPolicy;
