const API_URL = '/api';

export const api = {
  auth: {
    register: async (data: { email: string; password: string; name: string }) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    login: async (data: { email: string; password: string }) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  donations: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/donations`);
      return response.json();
    },

    create: async (data: {
      title: string;
      description: string;
      kind: string;
      location: string;
      images: string[];
    }) => {
      const response = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  messages: {
    getByConversation: async (conversationId: string) => {
      const response = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },

    send: async (data: { conversationId: string; content: string }) => {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
};