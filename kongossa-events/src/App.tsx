/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Subscription } from './pages/Subscription';
import { CreateEvent } from './pages/CreateEvent';
import { PaymentLink } from './pages/PaymentLink';
import { Success } from './pages/Success';
import { Toaster } from '../components/ui/sonner';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/abonnements" element={<Subscription />} />
          <Route path="/creer" element={<CreateEvent />} />
          <Route path="/paiement/:id" element={<PaymentLink />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

