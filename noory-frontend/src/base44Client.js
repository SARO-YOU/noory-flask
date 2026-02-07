// src/api/base44Client.js
const API_URL = 'https://api.noory.cloud-ip.cc/api';

export const base44 = {
  entities: {
    Product: {
      filter: async (params) => {
        try {
          let url = `${API_URL}/products`;
          const queryParams = new URLSearchParams();
          
          if (params?.in_stock !== undefined) {
            queryParams.append('in_stock', params.in_stock.toString());
          }
          if (params?.category && params.category !== 'all') {
            queryParams.append('category', params.category);
          }
          
          if (queryParams.toString()) url += `?${queryParams.toString()}`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch products');
          return await response.json();
        } catch (error) {
          console.error('Error:', error);
          return [];
        }
      }
    },
    
    Order: {
      create: async (orderData) => {
        try {
          const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          if (!response.ok) throw new Error('Failed to create order');
          return await response.json();
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      },
      
      filter: async (params) => {
        try {
          let url = `${API_URL}/orders`;
          if (params?.buyer_email) {
            url += `?buyer_email=${encodeURIComponent(params.buyer_email)}`;
          }
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch orders');
          return await response.json();
        } catch (error) {
          console.error('Error:', error);
          return [];
        }
      }
    },
    
    LoyaltyCard: {
      filter: async (params) => {
        try {
          const response = await fetch(
            `${API_URL}/loyalty-cards?email=${encodeURIComponent(params.user_email)}`
          );
          if (!response.ok) throw new Error('Failed to fetch loyalty card');
          return await response.json();
        } catch (error) {
          console.error('Error:', error);
          return [];
        }
      }
    }
  },
  
  auth: {
    me: async () => ({
      email: 'customer@nooriy.com',
      full_name: 'Valued Customer',
      id: 'user_123'
    })
  }
};