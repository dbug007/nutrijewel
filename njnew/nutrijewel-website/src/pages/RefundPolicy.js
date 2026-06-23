import React from 'react';
import PolicyLayout from '../components/PolicyLayout';

const RefundPolicy = () => {
  return (
    <PolicyLayout title="Refund & Return Policy" lastUpdated="December 17, 2025">
      
      <div className="policy-section">
        <h2>Overview</h2>
        <p>
          At NutriJewel, we are committed to providing you with high-quality, handcrafted nutritious snacks. 
          Customer satisfaction is our top priority. This policy outlines the circumstances under which refunds 
          and returns are accepted.
        </p>
      </div>

      <div className="policy-section">
        <h2>Nature of Our Products</h2>
        <p>
          Our products are perishable food items including cakes, traditional sweets, granola, energy bars, and 
          other healthy snacks. All items are made fresh to order without preservatives or artificial additives, 
          ensuring you receive the highest quality products.
        </p>
        <div className="policy-highlight">
          <strong>Important:</strong> Due to the perishable nature of our food products and health and safety 
          regulations, we generally do not accept returns once the order has been delivered.
        </div>
      </div>

      <div className="policy-section">
        <h2>Eligibility for Refunds</h2>
        <p>
          We will accept returns and process refunds in the following situations:
        </p>
        
        <h3>1. Damaged Products</h3>
        <p>
          If you receive products that are damaged during transit (broken, crushed, or tampered packaging), 
          please contact us immediately with:
        </p>
        <ul>
          <li>Clear photographs of the damaged product and packaging</li>
          <li>Order number and invoice details</li>
          <li>Description of the damage</li>
        </ul>

        <h3>2. Defective Products</h3>
        <p>
          If the products received are spoiled, expired, or have quality issues such as:
        </p>
        <ul>
          <li>Unusual smell or appearance</li>
          <li>Presence of foreign materials</li>
          <li>Manufacturing defects</li>
          <li>Products past expiry date (if applicable)</li>
        </ul>

        <h3>3. Wrong Items Delivered</h3>
        <p>
          If you receive incorrect products or items missing from your order, we will arrange for:
        </p>
        <ul>
          <li>Replacement of incorrect items with the correct ones</li>
          <li>Refund for missing items</li>
          <li>Complete order replacement if significantly wrong</li>
        </ul>

        <h3>4. Non-Delivery</h3>
        <p>
          If your order is not delivered within the committed timeline and courier tracking shows delivery failure 
          without valid reason, you are eligible for a full refund or reshipment.
        </p>
      </div>

      <div className="policy-section">
        <h2>Non-Refundable Situations</h2>
        <p>
          Refunds will <strong>NOT</strong> be provided in the following cases:
        </p>
        <ul>
          <li>Change of mind after delivery</li>
          <li>You do not like the taste or texture (personal preference)</li>
          <li>Delay in delivery caused by incorrect address provided by customer</li>
          <li>Customer unavailability for delivery resulting in order expiry</li>
          <li>Refusal to accept delivery without valid reason</li>
          <li>Products opened or partially consumed</li>
          <li>Products stored improperly after delivery</li>
          <li>Damage caused by customer after delivery</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>Reporting Timeline</h2>
        <div className="policy-highlight">
          <strong>Critical:</strong> All issues must be reported within <strong>24-48 hours</strong> of delivery 
          for us to process your refund request. Claims reported after this period may not be entertained.
        </div>
        <p>
          Given the perishable nature of our products, immediate reporting is essential to verify quality issues 
          and process refunds efficiently.
        </p>
      </div>

      <div className="policy-section">
        <h2>Return Process</h2>
        <p>
          If your refund request is approved:
        </p>
        <ol>
          <li>Contact us at the details provided below</li>
          <li>Provide order details and photographic evidence</li>
          <li>Our team will review your case within 24-48 hours</li>
          <li>Upon approval, return instructions will be shared (if applicable)</li>
          <li>Due to food safety regulations, we may not require physical return of perishable items</li>
          <li>Refund will be processed once verification is complete</li>
        </ol>
      </div>

      <div className="policy-section">
        <h2>Refund Method & Timeline</h2>
        
        <h3>Refund Method</h3>
        <p>
          Refunds will be processed to the original payment method used for the purchase:
        </p>
        <ul>
          <li>Credit/Debit Card: Refunded to the same card</li>
          <li>UPI/Net Banking: Refunded to the source account</li>
          <li>Cash on Delivery: Bank transfer to your provided account details</li>
        </ul>

        <h3>Refund Timeline</h3>
        <p>
          Once your return is approved and processed:
        </p>
        <ul>
          <li>Refund will be initiated within <strong>5-7 business days</strong></li>
          <li>Credit to your account may take additional 5-10 business days depending on your bank/payment provider</li>
          <li>You will receive email confirmation once refund is processed</li>
        </ul>

        <div className="policy-highlight">
          <strong>Note:</strong> Shipping charges (if any) are non-refundable unless the return is due to our error 
          (damaged/defective/wrong items).
        </div>
      </div>

      <div className="policy-section">
        <h2>Exchange Policy</h2>
        <p>
          In case of damaged or defective products, we offer the option to:
        </p>
        <ul>
          <li><strong>Replace</strong> the product with a fresh identical item</li>
          <li><strong>Refund</strong> the full amount to your original payment method</li>
        </ul>
        <p>
          The choice between replacement or refund can be made at the time of lodging the complaint. 
          Replacement orders will be processed within 7 days and shipped at no additional cost.
        </p>
      </div>

      <div className="policy-section">
        <h2>Cancellation Policy</h2>
        
        <h3>Before Shipment</h3>
        <p>
          You may cancel your order before it is shipped by contacting us immediately. Cancellations are accepted:
        </p>
        <ul>
          <li>Within 24 hours of placing the order</li>
          <li>Before the order goes into production/processing</li>
          <li>Full refund will be provided for pre-shipment cancellations</li>
        </ul>

        <h3>After Shipment</h3>
        <p>
          Once your order is shipped, cancellation is not possible. However, you may refuse delivery, and the 
          refund will be processed after deducting:
        </p>
        <ul>
          <li>Shipping charges (both ways)</li>
          <li>Packaging and handling costs</li>
          <li>Any applicable transaction fees</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>Quality Assurance</h2>
        <p>
          We take utmost care in:
        </p>
        <ul>
          <li>Using high-quality ingredients</li>
          <li>Following strict hygiene and safety standards</li>
          <li>Secure and temperature-appropriate packaging</li>
          <li>Partnering with reliable courier services</li>
          <li>Regular quality checks at every stage</li>
        </ul>
        <p>
          Despite our best efforts, if you face any issues with your order, please reach out to us and we will 
          do our best to resolve the matter promptly.
        </p>
      </div>

      <div className="policy-section">
        <h2>How to Reach Us for Returns</h2>
        <p>
          For any refund or return requests, please contact us with the following information:
        </p>
        <ul>
          <li>Order number</li>
          <li>Registered email ID/phone number</li>
          <li>Nature of issue (damaged/defective/wrong item/non-delivery)</li>
          <li>Clear photographs of the product and packaging</li>
          <li>Date and time of delivery</li>
        </ul>
      </div>

      <div className="policy-contact">
        <h3>Contact Us for Refunds & Returns</h3>
        <p>📞 <strong>Phone:</strong> <a href="tel:+919960637656">+91 996-063-7656</a></p>
        <p>📧 <strong>Email:</strong> <a href="mailto:hello@nutrijewel.com">hello@nutrijewel.com</a></p>
        <p>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/919960637656">Chat with us</a></p>
        <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
        <p><em>We aim to respond to all queries within 24 hours during business days.</em></p>
      </div>

    </PolicyLayout>
  );
};

export default RefundPolicy;
