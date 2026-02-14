import PublicLayout from "@/layouts/PublicLayout"
import { motion } from "framer-motion"

export default function Terms() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Terms of Service
          </motion.h1>

          <p className="text-white/60 mb-10">
            Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="space-y-10 text-white/80 leading-relaxed text-sm">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. ACCEPTANCE OF TERMS</h2>
              <p className="mb-4">
                Welcome to KongossaPay. These Terms of Service ("Terms," "ToS," or "Agreement") constitute a legally binding agreement between you ("you," "your," or "User") and KongossaPay Limited ("KongossaPay," "we," "us," or "our") governing your access to and use of the KongossaPay platform, mobile applications, website, and all related services (collectively, the "Services").
              </p>
              <p>
                By creating an account, accessing, or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. DISCLAIMERS AND WARRANTIES</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">13.1 Service "As Is"</h3>
                <p className="mb-2">Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Merchantability</li>
                  <li>Fitness for particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Accuracy or reliability</li>
                  <li>Uninterrupted or error-free operation</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">13.2 No Guarantee</h3>
                <p className="mb-2">We do not guarantee:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Continuous, uninterrupted, or secure access</li>
                  <li>Services will be error-free</li>
                  <li>All errors will be corrected</li>
                  <li>Services will meet your requirements</li>
                  <li>Results from using Services</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">13.3 Third-Party Services</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We are not responsible for third-party services</li>
                  <li>External links are provided for convenience only</li>
                  <li>We do not endorse third-party content</li>
                  <li>Third-party terms and conditions apply</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">13.4 Financial Advice</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We do not provide financial, investment, or legal advice</li>
                  <li>Services are for transaction processing only</li>
                  <li>Consult professionals for specific advice</li>
                  <li>We are not liable for financial decisions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. LIMITATION OF LIABILITY</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">14.1 Liability Cap</h3>
                <p className="mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW, KONGOSSAPAY'S TOTAL LIABILITY FOR ANY CLAIMS RELATED TO SERVICES SHALL NOT EXCEED THE GREATER OF:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The amount of fees you paid to us in the 12 months preceding the claim, or</li>
                  <li>$100 USD</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">14.2 Excluded Damages</h3>
                <p className="mb-2">WE SHALL NOT BE LIABLE FOR:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Loss of data or information</li>
                  <li>Cost of substitute services</li>
                  <li>Damages resulting from your use or inability to use Services</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">14.3 Exceptions</h3>
                <p className="mb-2">Limitations do not apply to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Damages caused by our gross negligence or willful misconduct</li>
                  <li>Liability that cannot be excluded by law</li>
                  <li>Personal injury or death caused by our negligence</li>
                  <li>Fraud or fraudulent misrepresentation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">14.4 Force Majeure</h3>
                <p className="mb-2">We are not liable for delays or failures caused by:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Natural disasters or acts of God</li>
                  <li>War, terrorism, or civil unrest</li>
                  <li>Government actions or regulations</li>
                  <li>Internet or telecommunications failures</li>
                  <li>Third-party service failures</li>
                  <li>Other events beyond our reasonable control</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. INDEMNIFICATION</h2>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless KongossaPay, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your use or misuse of Services</li>
                <li>Violation of these Terms</li>
                <li>Violation of any law or regulation</li>
                <li>Infringement of third-party rights</li>
                <li>Your content or data</li>
                <li>Negligence or willful misconduct</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">16. DISPUTE RESOLUTION</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">16.1 Informal Resolution</h3>
                <p className="mb-2">Before initiating formal proceedings:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Contact customer support at <a href="mailto:support@kongossapay.com" className="text-primary hover:underline">support@kongossapay.com</a></li>
                  <li>Provide detailed description of the dispute</li>
                  <li>Allow 30 days for good faith resolution attempt</li>
                  <li>Maintain confidentiality during resolution process</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">16.2 Arbitration</h3>
                <p className="mb-2">If informal resolution fails:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Disputes shall be resolved through binding arbitration</li>
                  <li>Arbitration conducted under [Arbitration Rules]</li>
                  <li>Location: [Arbitration Location]</li>
                  <li>Language: English or [Local Language]</li>
                  <li>Individual disputes only (no class actions)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">16.3 Exceptions to Arbitration</h3>
                <p className="mb-2">The following may be brought in court:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Small claims court actions</li>
                  <li>Injunctive relief requests</li>
                  <li>Intellectual property disputes</li>
                  <li>Collection actions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">16.4 Governing Law</h3>
                <p>These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">17. TERMINATION</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">17.1 Termination by You</h3>
                <p className="mb-2">You may terminate your account by:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Contacting customer support</li>
                  <li>Following account closure procedures</li>
                  <li>Withdrawing all funds</li>
                  <li>Settling outstanding obligations</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">17.2 Termination by Us</h3>
                <p className="mb-2">We may terminate or suspend your account:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Immediately for Terms violations</li>
                  <li>For inactivity exceeding [period]</li>
                  <li>For suspected fraud or illegal activity</li>
                  <li>For compliance or regulatory reasons</li>
                  <li>With 30 days' notice without cause</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">17.3 Effects of Termination</h3>
                <p className="mb-2">Upon termination:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access to Services will be disabled</li>
                  <li>Outstanding transactions will be completed</li>
                  <li>Funds will be returned to you (minus fees and obligations)</li>
                  <li>You remain liable for pre-termination activities</li>
                  <li>Provisions that should survive will remain in effect</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">17.4 Surviving Provisions</h3>
                <p className="mb-2">The following sections survive termination:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Intellectual Property</li>
                  <li>Limitation of Liability</li>
                  <li>Indemnification</li>
                  <li>Dispute Resolution</li>
                  <li>Governing Law</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">18. AMENDMENTS AND MODIFICATIONS</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">18.1 Changes to Terms</h3>
                <p className="mb-2">We reserve the right to modify these Terms:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With 30 days' advance notice for material changes</li>
                  <li>Notice provided via email and platform notifications</li>
                  <li>Changes effective upon notice for non-material updates</li>
                  <li>Continued use constitutes acceptance of changes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">18.2 Rejecting Changes</h3>
                <p className="mb-2">If you disagree with changes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You may terminate your account before changes take effect</li>
                  <li>Continued use after effective date means acceptance</li>
                  <li>Previous Terms apply until effective date</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">19. GENERAL PROVISIONS</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">19.1 Entire Agreement</h3>
                <p>These Terms, along with our Privacy Policy and other referenced policies, constitute the entire agreement between you and KongossaPay.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">19.2 Severability</h3>
                <p>If any provision is found invalid or unenforceable, remaining provisions remain in full effect.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">19.3 Waiver</h3>
                <p>Failure to enforce any provision does not constitute waiver of that provision or any other provision.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">19.4 Assignment</h3>
                <p>You may not assign these Terms. We may assign our rights and obligations without notice.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">19.5 No Agency</h3>
                <p>These Terms do not create any agency, partnership, joint venture, or employment relationship.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">19.6 Notices</h3>
                <p>Notices to you will be sent to your registered email address. Notices to us should be sent to <a href="mailto:legal@kongossapay.com" className="text-primary hover:underline">legal@kongossapay.com</a>.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">19.7 Language</h3>
                <p>These Terms are executed in English. Translations are for convenience only.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. ELIGIBILITY AND ACCOUNT REGISTRATION</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">2.1 Age and Legal Capacity</h3>
                <p className="mb-2">To use KongossaPay Services, you must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Be at least 18 years of age or the age of legal majority in your jurisdiction</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be prohibited from using financial services under applicable laws</li>
                  <li>Not be located in a country subject to international sanctions or restrictions</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">2.2 Account Registration</h3>
                <p className="mb-2">To access our Services, you must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Provide valid identification documents as required</li>
                  <li>Complete identity verification procedures</li>
                  <li>Maintain only one personal account (duplicate accounts may be terminated)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">2.3 Account Types</h3>
                <p className="mb-2">We offer different account types:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-white">Personal Account:</strong> For individual users conducting personal transactions</li>
                  <li><strong className="text-white">Business Account:</strong> For registered businesses and merchants</li>
                  <li><strong className="text-white">Merchant Account:</strong> For businesses accepting payments through KongossaPay</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">2.4 Account Verification</h3>
                <p className="mb-2">Account verification levels include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-white">Basic:</strong> Limited functionality with minimal verification</li>
                  <li><strong className="text-white">Standard:</strong> Full service access with identity verification</li>
                  <li><strong className="text-white">Enhanced:</strong> Increased limits with comprehensive documentation</li>
                  <li><strong className="text-white">Business:</strong> Full business verification including corporate documents</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. ACCOUNT SECURITY</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">3.1 Your Responsibilities</h3>
                <p className="mb-2">You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maintaining the confidentiality of your login credentials</li>
                  <li>All activities conducted through your account</li>
                  <li>Ensuring your contact information is current</li>
                  <li>Implementing strong passwords and security practices</li>
                  <li>Protecting your account from unauthorized access</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">3.2 Security Measures</h3>
                <p className="mb-2">You must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use strong, unique passwords</li>
                  <li>Enable two-factor authentication when available</li>
                  <li>Never share your account credentials</li>
                  <li>Immediately notify us of unauthorized access</li>
                  <li>Use secure internet connections when accessing your account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">3.3 Account Suspension</h3>
                <p className="mb-2">We reserve the right to suspend or terminate accounts that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Show signs of unauthorized access</li>
                  <li>Violate these Terms</li>
                  <li>Engage in suspicious or fraudulent activity</li>
                  <li>Fail to complete verification requirements</li>
                  <li>Remain inactive for extended periods</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. SERVICES PROVIDED</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">4.1 Digital Wallet Services</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Secure storage of digital funds</li>
                    <li>Multi-currency support</li>
                    <li>Balance management tools</li>
                    <li>Transaction history and reporting</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">4.2 Money Transfer Services</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Domestic money transfers</li>
                    <li>International remittances</li>
                    <li>Peer-to-peer transfers</li>
                    <li>Bulk payment processing</li>
                    <li>Scheduled and recurring transfers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">4.3 Payment Services</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Merchant payment processing</li>
                    <li>Bill payment services</li>
                    <li>Mobile money integration</li>
                    <li>QR code payments</li>
                    <li>Payment links and invoicing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">4.4 Additional Services</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Currency exchange</li>
                    <li>Mobile top-up services</li>
                    <li>Utility bill payments</li>
                    <li>Merchant solutions</li>
                    <li>API integration for businesses</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2">4.5 Service Availability</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Services are provided subject to system availability</li>
                  <li>We do not guarantee uninterrupted service</li>
                  <li>Scheduled maintenance will be communicated in advance</li>
                  <li>Emergency maintenance may occur without notice</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. FEES AND CHARGES</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">5.1 Fee Structure</h3>
                <p className="mb-2">KongossaPay charges fees for certain services including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Transaction fees (based on transaction type and amount)</li>
                  <li>Currency conversion fees</li>
                  <li>International transfer fees</li>
                  <li>Merchant processing fees</li>
                  <li>Premium service fees</li>
                  <li>Withdrawal fees to external accounts</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">5.2 Fee Disclosure</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All applicable fees are displayed before transaction confirmation</li>
                  <li>Fee schedules are available on our website and mobile application</li>
                  <li>You must review and accept fees before completing transactions</li>
                  <li>Fees are non-refundable except in cases of service error</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">5.3 Fee Changes</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We reserve the right to modify fees with 30 days' advance notice</li>
                  <li>Notice will be provided via email and platform notifications</li>
                  <li>Continued use of Services constitutes acceptance of new fees</li>
                  <li>You may close your account if you disagree with fee changes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">5.4 Third-Party Fees</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>External financial institutions may charge additional fees</li>
                  <li>Currency exchange rates include market rates plus our margin</li>
                  <li>You are responsible for all third-party fees</li>
                  <li>We are not liable for fees charged by other service providers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. TRANSACTION LIMITS</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">6.1 Standard Limits</h3>
                <p className="mb-2">Transaction limits vary based on:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Account verification level</li>
                  <li>Transaction type</li>
                  <li>Geographic location</li>
                  <li>Regulatory requirements</li>
                  <li>Account history and standing</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">6.2 Limit Categories</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-white">Daily Limits:</strong> Maximum transactions per 24-hour period</li>
                  <li><strong className="text-white">Weekly Limits:</strong> Maximum transactions per 7-day period</li>
                  <li><strong className="text-white">Monthly Limits:</strong> Maximum transactions per 30-day period</li>
                  <li><strong className="text-white">Per-Transaction Limits:</strong> Maximum individual transaction amounts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">6.3 Limit Increases</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Higher limits available with enhanced verification</li>
                  <li>Business accounts have separate limit structures</li>
                  <li>Limit increases subject to compliance review</li>
                  <li>Temporary limit increases may be available upon request</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. TRANSACTION PROCESSING</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">7.1 Transaction Authorization</h3>
                <p className="mb-2">By initiating a transaction, you:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Authorize KongossaPay to process the transaction</li>
                  <li>Confirm you have sufficient funds or credit</li>
                  <li>Agree to pay all applicable fees</li>
                  <li>Accept the transaction cannot be reversed once processed</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">7.2 Processing Times</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-white">Internal transfers:</strong> Instant to 24 hours</li>
                  <li><strong className="text-white">Bank transfers:</strong> 1-3 business days</li>
                  <li><strong className="text-white">International transfers:</strong> 2-5 business days</li>
                  <li>Processing times may vary based on destination and method</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">7.3 Transaction Cancellation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Transactions can be cancelled before processing begins</li>
                  <li>Once processing starts, cancellation may not be possible</li>
                  <li>Cancellation fees may apply</li>
                  <li>Refunds subject to investigation and verification</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">7.4 Failed Transactions</h3>
                <p className="mb-2">In case of transaction failure:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Funds will be returned to your account</li>
                  <li>Investigation will determine cause of failure</li>
                  <li>We will notify you of failure reasons when possible</li>
                  <li>You may be required to re-initiate the transaction</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">7.5 Disputed Transactions</h3>
                <p className="mb-2">If you dispute a transaction:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Contact customer support within 30 days</li>
                  <li>Provide detailed information and evidence</li>
                  <li>Cooperate with investigation procedures</li>
                  <li>Resolution may take up to 60 days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. PROHIBITED ACTIVITIES</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">8.1 Illegal Activities</h3>
                <p className="mb-2">You must not use KongossaPay Services for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Money laundering or terrorist financing</li>
                  <li>Purchase of illegal goods or services</li>
                  <li>Fraud or fraudulent transactions</li>
                  <li>Tax evasion or circumvention</li>
                  <li>Violation of any applicable laws or regulations</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">8.2 Prohibited Transactions</h3>
                <p className="mb-2">Services cannot be used for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gambling or online gaming (where prohibited)</li>
                  <li>Adult entertainment services</li>
                  <li>Weapons, explosives, or controlled substances</li>
                  <li>Stolen goods or counterfeit items</li>
                  <li>Ponzi schemes or pyramid schemes</li>
                  <li>Cryptocurrency trading (unless explicitly permitted)</li>
                  <li>Unlicensed financial services</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">8.3 Platform Abuse</h3>
                <p className="mb-2">You must not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Create multiple accounts to circumvent limits</li>
                  <li>Use automated systems to access Services</li>
                  <li>Attempt to manipulate or exploit platform features</li>
                  <li>Engage in phishing or social engineering</li>
                  <li>Interfere with Services or other users</li>
                  <li>Reverse engineer our systems or software</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">8.4 Consequences of Violations</h3>
                <p className="mb-2">Violation of prohibited activities may result in:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Immediate account suspension or termination</li>
                  <li>Freezing of funds pending investigation</li>
                  <li>Reporting to law enforcement authorities</li>
                  <li>Legal action to recover damages</li>
                  <li>Permanent ban from Services</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. COMPLIANCE AND REGULATORY REQUIREMENTS</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">9.1 Know Your Customer (KYC)</h3>
                <p className="mb-2">You must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate identification information</li>
                  <li>Submit required verification documents</li>
                  <li>Respond to additional information requests</li>
                  <li>Update information when circumstances change</li>
                  <li>Cooperate with periodic re-verification</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">9.2 Anti-Money Laundering (AML)</h3>
                <p className="mb-2">We implement AML measures including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Transaction monitoring and analysis</li>
                  <li>Suspicious activity reporting</li>
                  <li>Sanctions screening</li>
                  <li>Enhanced due diligence for high-risk transactions</li>
                  <li>Cooperation with regulatory authorities</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">9.3 Regulatory Reporting</h3>
                <p className="mb-2">We may:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Report transactions as required by law</li>
                  <li>Share information with regulatory authorities</li>
                  <li>Freeze accounts pending investigation</li>
                  <li>Request additional documentation</li>
                  <li>Decline transactions that raise compliance concerns</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">9.4 Tax Compliance</h3>
                <p className="mb-2">You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Reporting income and transactions to tax authorities</li>
                  <li>Paying all applicable taxes</li>
                  <li>Providing tax identification numbers when required</li>
                  <li>Understanding tax implications of transactions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. INTELLECTUAL PROPERTY</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">10.1 Our Rights</h3>
                <p className="mb-2">KongossaPay owns all rights to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Platform software and technology</li>
                  <li>Trademarks, logos, and brand elements</li>
                  <li>Website and application content</li>
                  <li>Documentation and marketing materials</li>
                  <li>Patents and proprietary processes</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">10.2 Limited License</h3>
                <p className="mb-2">We grant you a limited, non-exclusive, non-transferable license to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access and use our Services</li>
                  <li>Use our mobile applications</li>
                  <li>View and use platform content for personal purposes</li>
                  <li>This license terminates upon account closure or termination</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">10.3 Restrictions</h3>
                <p className="mb-2">You may not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Copy, modify, or distribute our software</li>
                  <li>Use our trademarks without permission</li>
                  <li>Create derivative works</li>
                  <li>Remove proprietary notices</li>
                  <li>Use our intellectual property for commercial purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. USER CONTENT AND DATA</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">11.1 Your Content</h3>
                <p className="mb-2">You retain ownership of content you submit, but grant us:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>License to use content to provide Services</li>
                  <li>Right to store and process your data</li>
                  <li>Permission to display transaction information</li>
                  <li>Ability to use anonymized data for analytics</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">11.2 Content Restrictions</h3>
                <p className="mb-2">Your content must not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violate intellectual property rights</li>
                  <li>Contain malicious code or malware</li>
                  <li>Include false or misleading information</li>
                  <li>Violate privacy rights of others</li>
                  <li>Contain offensive or inappropriate material</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">11.3 Data Accuracy</h3>
                <p className="mb-2">You represent that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All information provided is accurate</li>
                  <li>Documents submitted are genuine</li>
                  <li>You have authority to share provided information</li>
                  <li>Information will be updated when necessary</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. PRIVACY AND DATA PROTECTION</h2>
              <p className="mb-4">
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Services, you also agree to our Privacy Policy.
              </p>
              
              <h3 className="text-lg font-medium text-white mb-2">Key privacy principles:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>We collect only necessary personal information</li>
                <li>Data is protected with industry-standard security</li>
                <li>Information is used only for legitimate purposes</li>
                <li>You have rights regarding your personal data</li>
                <li>We comply with applicable data protection laws</li>
              </ul>
            </section>
            {/* Section 13 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">13. DISCLAIMERS AND WARRANTIES</h2>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">13.1 Service "As Is"</h3>
                <p className="mb-2">Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Merchantability</li>
                    <li>Fitness for particular purpose</li>
                    <li>Non-infringement</li>
                    <li>Accuracy or reliability</li>
                    <li>Uninterrupted or error-free operation</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">13.2 No Guarantee</h3>
                <p className="mb-2">We do not guarantee:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Continuous, uninterrupted, or secure access</li>
                    <li>Services will be error-free</li>
                    <li>All errors will be corrected</li>
                    <li>Services will meet your requirements</li>
                    <li>Results from using Services</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">13.3 Third-Party Services</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>We are not responsible for third-party services</li>
                    <li>External links are provided for convenience only</li>
                    <li>We do not endorse third-party content</li>
                    <li>Third-party terms and conditions apply</li>
                </ul>
                </div>

                <div>
                <h3 className="text-lg font-medium text-white mb-2">13.4 Financial Advice</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>We do not provide financial, investment, or legal advice</li>
                    <li>Services are for transaction processing only</li>
                    <li>Consult professionals for specific advice</li>
                    <li>We are not liable for financial decisions</li>
                </ul>
                </div>
            </section>

            {/* Section 14 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">14. LIMITATION OF LIABILITY</h2>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">14.1 Liability Cap</h3>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, KONGOSSAPAY'S TOTAL LIABILITY FOR ANY CLAIMS RELATED TO SERVICES SHALL NOT EXCEED THE GREATER OF:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>The amount of fees you paid to us in the 12 months preceding the claim, or</li>
                    <li>$100 USD</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">14.2 Excluded Damages</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, revenue, or business opportunities</li>
                    <li>Loss of data or information</li>
                    <li>Cost of substitute services</li>
                    <li>Damages resulting from your use or inability to use Services</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">14.3 Exceptions</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Damages caused by our gross negligence or willful misconduct</li>
                    <li>Liability that cannot be excluded by law</li>
                    <li>Personal injury or death caused by our negligence</li>
                    <li>Fraud or fraudulent misrepresentation</li>
                </ul>
                </div>

                <div>
                <h3 className="text-lg font-medium text-white mb-2">14.4 Force Majeure</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Natural disasters or acts of God</li>
                    <li>War, terrorism, or civil unrest</li>
                    <li>Government actions or regulations</li>
                    <li>Internet or telecommunications failures</li>
                    <li>Third-party service failures</li>
                    <li>Other events beyond our reasonable control</li>
                </ul>
                </div>
            </section>

            {/* Section 15 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">15. INDEMNIFICATION</h2>
                <p>You agree to indemnify, defend, and hold harmless KongossaPay, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
                <ul className="list-disc pl-6 space-y-1">
                <li>Your use or misuse of Services</li>
                <li>Violation of these Terms</li>
                <li>Violation of any law or regulation</li>
                <li>Infringement of third-party rights</li>
                <li>Your content or data</li>
                <li>Negligence or willful misconduct</li>
                </ul>
            </section>

            {/* Section 16 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">16. DISPUTE RESOLUTION</h2>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">16.1 Informal Resolution</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Contact customer support at support@kongossapay.com</li>
                    <li>Provide detailed description of the dispute</li>
                    <li>Allow 30 days for good faith resolution attempt</li>
                    <li>Maintain confidentiality during resolution process</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">16.2 Arbitration</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Disputes shall be resolved through binding arbitration</li>
                    <li>Arbitration conducted under [Arbitration Rules]</li>
                    <li>Location: [Arbitration Location]</li>
                    <li>Language: English or [Local Language]</li>
                    <li>Individual disputes only (no class actions)</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">16.3 Exceptions to Arbitration</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Small claims court actions</li>
                    <li>Injunctive relief requests</li>
                    <li>Intellectual property disputes</li>
                    <li>Collection actions</li>
                </ul>
                </div>

                <div>
                <h3 className="text-lg font-medium text-white mb-2">16.4 Governing Law</h3>
                <p>These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.</p>
                </div>
            </section>

            {/* Section 17 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">17. TERMINATION</h2>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">17.1 Termination by You</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Contacting customer support</li>
                    <li>Following account closure procedures</li>
                    <li>Withdrawing all funds</li>
                    <li>Settling outstanding obligations</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">17.2 Termination by Us</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Immediately for Terms violations</li>
                    <li>For inactivity exceeding [period]</li>
                    <li>For suspected fraud or illegal activity</li>
                    <li>For compliance or regulatory reasons</li>
                    <li>With 30 days' notice without cause</li>
                </ul>
                </div>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">17.3 Effects of Termination</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Access to Services will be disabled</li>
                    <li>Outstanding transactions will be completed</li>
                    <li>Funds will be returned to you (minus fees and obligations)</li>
                    <li>You remain liable for pre-termination activities</li>
                    <li>Provisions that should survive will remain in effect</li>
                </ul>
                </div>

                <div>
                <h3 className="text-lg font-medium text-white mb-2">17.4 Surviving Provisions</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Intellectual Property</li>
                    <li>Limitation of Liability</li>
                    <li>Indemnification</li>
                    <li>Dispute Resolution</li>
                    <li>Governing Law</li>
                </ul>
                </div>
            </section>

            {/* Section 18 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">18. AMENDMENTS AND MODIFICATIONS</h2>

                <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">18.1 Changes to Terms</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>With 30 days' advance notice for material changes</li>
                    <li>Notice provided via email and platform notifications</li>
                    <li>Changes effective upon notice for non-material updates</li>
                    <li>Continued use constitutes acceptance of changes</li>
                </ul>
                </div>

                <div>
                <h3 className="text-lg font-medium text-white mb-2">18.2 Rejecting Changes</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>You may terminate your account before changes take effect</li>
                    <li>Continued use after effective date means acceptance</li>
                    <li>Previous Terms apply until effective date</li>
                </ul>
                </div>
            </section>

            {/* Section 19 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">19. GENERAL PROVISIONS</h2>
                <ul className="list-disc pl-6 space-y-1">
                <li>Entire Agreement: These Terms, along with our Privacy Policy and other referenced policies, constitute the entire agreement between you and KongossaPay.</li>
                <li>Severability: If any provision is found invalid or unenforceable, remaining provisions remain in full effect.</li>
                <li>Waiver: Failure to enforce any provision does not constitute waiver of that provision or any other provision.</li>
                <li>Assignment: You may not assign these Terms. We may assign our rights and obligations without notice.</li>
                <li>No Agency: These Terms do not create any agency, partnership, joint venture, or employment relationship.</li>
                <li>Notices: Notices to you will be sent to your registered email address. Notices to us should be sent to legal@kongossapay.com.</li>
                <li>Language: These Terms are executed in English. Translations are for convenience only.</li>
                </ul>
            </section>

            {/* Section 20 */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">20. CONTACT INFORMATION</h2>
                <p>
                For questions about these Terms of Service:<br />
                KongossaPay Limited<br />
                Address: [Company Address]<br />
                Email: legal@kongossapay.com<br />
                Phone: [Phone Number]<br />
                Support: support@kongossapay.com
                </p>
            </section>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
