import axios from "axios";

const API_URL = "https://api.exchangerate-api.com/v4/latest/";

export const CurrencyService = {
  getExchangeRates: async (baseCurrency: string = "USD") => {
    try {
      const response = await axios.get(`${API_URL}${baseCurrency}`);
      return response.data.rates; // Returns an object with currency codes as keys
    } catch (error) {
      console.error("CurrencyService Error:", error);
      throw new Error("Failed to fetch exchange rates");
    }
  },

  convertCurrency: (amount: number, rate: number) => {
    return (amount * rate).toFixed(2); // Converts and rounds to 2 decimal places
  },
};
