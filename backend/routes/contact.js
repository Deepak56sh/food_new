// routes/contact.js
const express = require("express");
const Contact = require("../models/Contact");
const auth = require("../middleware/auth");
const router = express.Router();
const nodemailer = require("nodemailer");

let transporter;

// Setup Ethereal transporter (for testing emails)
(async () => {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("✅ Ethereal test account created");
  console.log("   Login:", testAccount.user);
  console.log("   Pass:", testAccount.pass);
})();

// ------------------- ROUTES -------------------

// Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const contact = new Contact({ name, email, phone, message });
    await contact.save();

    // Send notification email (to Ethereal)
    const info = await transporter.sendMail({
      from: '"FoodDelight" <no-reply@fooddelight.com>',
      to: "admin@example.com", // dummy receiver
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("📩 Preview URL (contact form):", nodemailer.getTestMessageUrl(info));

    res.json({ message: "Message sent successfully (check console for preview link)" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all contacts (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete contact
router.delete("/:id", auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send reply
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { message } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const info = await transporter.sendMail({
      from: '"FoodDelight" <no-reply@fooddelight.com>',
      to: contact.email,
      subject: "Re: Your message to FoodDelight",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">FoodDelight Response</h2>
          <p>Dear ${contact.name},</p>
          <p>Thank you for contacting us. Here is our response:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p>If you have any further questions, please contact us again.</p>
          <br>
          <p>Best regards,<br>FoodDelight Team</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("📩 Preview URL (reply):", nodemailer.getTestMessageUrl(info));

    // Update contact
    contact.isReplied = true;
    contact.replyMessage = message;
    contact.repliedAt = new Date();
    await contact.save();

    res.json({ message: "Reply sent successfully (check console for preview link)" });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ message: "Error sending reply" });
  }
});

module.exports = router;
