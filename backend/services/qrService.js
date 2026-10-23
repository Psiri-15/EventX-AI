const QRCode = require('qrcode');

/**
 * Generate a QR code data URL from a ticket payload
 * @param {Object} payload { ticketCode, eventId, bookingRef }
 * @returns {Promise<string>} Base64 Data URL of the generated QR Code
 */
const generateTicketQR = async (payload) => {
  try {
    const dataString = JSON.stringify({
      code: payload.ticketCode,
      eid: payload.eventId,
      bref: payload.bookingRef,
      v: '1.0',
    });

    const qrDataURL = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return qrDataURL;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate ticket QR code');
  }
};

module.exports = { generateTicketQR };
