// import React, { useEffect } from 'react';

// // Le code du Service Worker qui sera injecté
// const serviceWorkerCode = `
//   const CACHE_NAME = 'kongossapay-cache-v1';
//   // URLs à mettre en cache pour l'App Shell. 
//   // On met en cache la racine pour assurer que l'app se lance hors ligne.
//   const urlsToCache = [
//     '/',
//     '/manifest.json' // Le nom est symbolique, le contenu est déjà dans le head
//   ];

//   // Événement d'installation : on met en cache les fichiers de l'App Shell
//   self.addEventListener('install', (event) => {
//     event.waitUntil(
//       caches.open(CACHE_NAME)
//         .then((cache) => {
//           console.log('Opened cache');
//           return cache.addAll(urlsToCache);
//         })
//     );
//   });

//   // Événement fetch : intercepte les requêtes réseau
//   self.addEventListener('fetch', (event) => {
//     // Stratégie "Cache falling back to network"
//     event.respondWith(
//       caches.match(event.request)
//         .then((response) => {
//           // Si la réponse est dans le cache, on la retourne
//           if (response) {
//             return response;
//           }
//           // Sinon, on fait la requête réseau
//           return fetch(event.request);
//         })
//     );
//   });
// `;

// const PWAInstaller = () => {
//   useEffect(() => {
//     // --- 1. Enregistrement du Service Worker ---
//     if ('serviceWorker' in navigator) {
//       // Créer un Blob à partir du code du service worker
//       const blob = new Blob([serviceWorkerCode], { type: 'application/javascript' });
//       // Créer une URL pour le Blob
//       const swUrl = URL.createObjectURL(blob);

//       navigator.serviceWorker.register(swUrl)
//         .then((registration) => {
//           console.log('Service Worker registered with scope:', registration.scope);
//         })
//         .catch((error) => {
//           console.error('Service Worker registration failed:', error);
//         });
//     }

//     // --- 2. Création et injection du Manifest ---
//     const manifest = {
//       "short_name": "KongossaPay",
//       "name": "KongossaPay - Digital Wallet",
//       "description": "Send, receive, and manage money with ease. Join millions who trust KongossaPay for secure, instant, and affordable financial transactions worldwide.",
//       "icons": [
//         {
//           "src": "https://avatar.vercel.sh/KongossaPay.png?size=192",
//           "type": "image/png",
//           "sizes": "192x192"
//         },
//         {
//           "src": "https://avatar.vercel.sh/KongossaPay.png?size=512",
//           "type": "image/png",
//           "sizes": "512x512"
//         }
//       ],
//       "start_url": ".",
//       "display": "standalone",
//       "theme_color": "#1e3a8a",
//       "background_color": "#f1f5f9"
//     };

//     // Éviter de créer des liens de manifest en double
//     if (!document.querySelector('link[rel="manifest"]')) {
//         const manifestBlob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
//         const manifestUrl = URL.createObjectURL(manifestBlob);

//         const link = document.createElement('link');
//         link.rel = 'manifest';
//         link.id = 'manifest-link';
//         link.href = manifestUrl;
//         document.head.appendChild(link);
//     }
    
//     // Cleanup function pour supprimer les éléments lors du démontage du composant
//     return () => {
//       const link = document.getElementById('manifest-link');
//       if (link) {
//         document.head.removeChild(link);
//       }
//     };

//   }, []);

//   return null; // Ce composant n'affiche rien
// };

// export default PWAInstaller;