function generateOrderID() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
      
        let orderID = '';
      
        // Generate 2 random characters
        for (let i = 0; i < 2; i++) {
          const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
          orderID += randomChar;
        }
      
        // Generate 4 random numbers
        for (let i = 0; i < 4; i++) {
          const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
          orderID += randomNumber;
        }
      
        return orderID;
      }

module.exports = generateOrderID;