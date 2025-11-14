const express = require("express");
const cors = require("cors");
// const { connectDB, instance } = require("./connectdb");
// const crypto = require("crypto");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

//port config
require("dotenv").config();
const port = process.env.PORT;
const app = express();
// app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000", // your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
//connect to database
// connectDB();
app.use(express.urlencoded({ extended: true }));
//using middleware
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

//  Store connected clients
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("previous_messages", "lastMessages");

  socket.emit("connected", { message: "Connected to backend!" });

  // Frontend → Backend → WhatsApp
  socket.on("send_message", async (data) => {
    console.log("Message from frontend:", data);
    // io.emit("incoming_message", { from: "server", text: "incoming_message Ping!" });

    await sendWhatsAppReply(data.to, data.message);
  });

  socket.on("connect_error", (err) => {
    console.error("Connection Error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/", async (req, res) => {
  res.send("get app called");
});

// SEND MESSAGE (POST)
app.post("/message", async (req, res) => {
  try {
    const url = `${process.env.FACEBOOK_URL}/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: process.env.RECIPIENT_PHONE_NUMBER,
        type: "template",
        template: {
          name: "welcome_message",
          language: { code: "en_US" },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Message sent:", response.data);
    res.json({ message: "success", data: response.data });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "failed",
      error: error.response?.data || error.message,
    });
  }
});

//  1. VERIFY WEBHOOK (GET)
app.get("/webhook", async (req, res) => {
  try {
    const VERIFY_TOKEN = process.env.WEB_HOOK_VERIFY_TOKEN;
    console.log(req.query, "query");
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully ");
      res.status(200).send(challenge);
    } else {
      console.error("Webhook verification failed ");
      res.sendStatus(403);
    }
  } catch (error) {
    console.log(error, "error get");
    throw new Error("Failed to retrieve data.");
  }
});

//  2. RECEIVE MESSAGES (POST)
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body, "req.body");

    console.log("Incoming webhook:", JSON.stringify(body, null, 2));

    if (body.object === "whatsapp_business_account") {
      for (let entry of body.entry) {
        for (let change of entry.changes) {
          if (change.field === "messages") {
            console.log("message");
            const data = change.value;

            if (data.messages) {
              for (let in_message of data.messages) {
                if (in_message.type == "text") {
                  console.log("in_message.from", in_message.from);
                }
              }
            }
            if (data.statuses) {
              for (let status of data.statuses) {
                console.log("status.status", status.status);
              }
            }
          } else if (change.field === "message_echoes") {
            console.log("message_echoes");
          } else if (change.field === "message_template_status_update") {
            console.log("message_template_status_update", change.value);
          }
        }
      }

      // handle message events
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const text = message.text?.body;
        console.log(`Message from ${from}: ${text}`);

        // Send message to all connected clients
        io.emit("incoming_message", { from, text });
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(error, "error post");
    throw new Error("Failed to retrieve data.");
  }
});

async function sendWhatsAppReply(to, customerMessage) {
  try {
    const url = `${process.env.FACEBOOK_URL}/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;

    // Simple text reply
    const data = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: customerMessage },
    };

    const headers = {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, data, { headers });
    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Send Error:", error.response?.data || error.message);
  }
}

// setInterval(() => {
//   io.emit("incoming_message", { from: "server", text: "Ping!" });
// }, 5000);

// CREATE TEMPLATE (POST)
app.post("/create-template", async (req, res) => {
  try {
    const { name, language, category, header, body, footer } = req.body;
    const url = `${process.env.FACEBOOK_URL}/${process.env.API_VERSION}/${process.env.WABA_ID}/message_templates`;

    let components = [];
    if (header !== "") {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: header,
      });
    }
    if (body !== "") {
      components.push({
        type: "BODY",
        text: body,
        example: {
          body_text: [["Mithun", "12345"]],
        },
      });
    }

    if (footer !== "") {
      components.push({
        type: "FOOTER",
        text: footer,
      });
    }

    const template = {
      name,
      language,
      category,
      components,
    };

    const template1 = {
      name: "order_update_template_five",
      language: "en_US",
      category: "UTILITY",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Order Update",
        },
        {
          type: "BODY",
          text: "Hi {{1}}, your order #{{2}} has been shipped!",
          example: {
            body_text: [["Mithun", "12345"]],
          },
        },
        {
          type: "FOOTER",
          text: "Order update",
        },
      ],
    };

    const template2 = {
      name: "appointment_confirmation_pdf",
      language: "en_US",
      category: "UTILITY",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Tabal Header",
        },
        {
          type: "BODY",
          text: "Hi {{1}}, your appointment for {{2}} is scheduled. Please confirm your slot using the buttons below.",
          example: {
            body_text: [["Mithun", "Dental Checkup on 20th Nov"]],
          },
        },
        {
          type: "FOOTER",
          text: "Thank you for using MyEduate!",
        },
        {
          type: "BUTTONS",
          buttons: [
            {
              type: "QUICK_REPLY",
              text: "Confirm",
            },
            {
              type: "QUICK_REPLY",
              text: "Reschedule",
            },
          ],
        },
      ],
    };

    const template3 = {
      name: "appointment_confirmation_pdf",
      language: "en_US",
      category: "UTILITY",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Tabal Header",
        },
        {
          type: "BODY",
          text: "Hi  your appointment for is scheduled. Please confirm your slot using the buttons below.",
        },
        {
          type: "FOOTER",
          text: "Thank you for using MyEduate!",
        },
      ],
    };

    const template4 = {
      name: "notification",
      language: "en_US",
      category: "UTILITY",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Admission Update",
        },
        {
          type: "BODY",
          text: "Your admission has been confirmed. Your reporting date is {{1}} at {{2}}. Please carry your ID card and required documents.",
        },
        {
          type: "FOOTER",
          text: "School Notice",
        },
      ],
    };
    console.log(template, "template");
    const response = await axios.post(url, template, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(
      "Template creation error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// DELETE TEMPLATE (DELETE)
app.post("/delete-template", async (req, res) => {
  const url = `${process.env.FACEBOOK_URL}/${process.env.API_VERSION}/${process.env.WABA_ID}/message_templates`;

  try {
    const response = await axios.delete(url, {
      data: {
        name: req.body.name,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Template delete error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// UPDATE TEMPLATE (POST)  REJECTED TEMPLATE ONLY UPDATE
app.post("/update-template", async (req, res) => {
  try {
    const { name, language, category, header, body, footer, templateId } =
      req.body;

    const url = `${process.env.FACEBOOK_URL}/${process.env.API_VERSION}/${templateId}`;

    let components = [];
    if (header !== "") {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: header,
      });
    }
    if (body !== "") {
      components.push({
        type: "BODY",
        text: body,
        example: {
          body_text: [["Mithun", "12345"]],
        },
      });
    }

    if (footer !== "") {
      components.push({
        type: "FOOTER",
        text: footer,
      });
    }

    const template = {
      name,
      language,
      category,
      components,
    };

    const template4 = {
      name: "test_update",
      language: "en_US",
      category: "UTILITY",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "Admission Update Test",
        },
        {
          type: "BODY",
          text: "Your admission has been confirmed. Your reporting date is {{1}} at {{2}}. Please carry your ID card and required documents.",
        },
        {
          type: "FOOTER",
          text: "School Notice Test",
        },
      ],
    };

    console.log(template4, "template4");

    const response = await axios.post(url, template4, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);

    res.json(response.data);
  } catch (err) {
    console.error(
      "Template creation error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// GET ALL TEMPLATES (GET)
app.get("/get-templates", async (req, res) => {
  try {
    const url = `${process.env.FACEBOOK_URL}/${process.env.API_VERSION}/${process.env.WABA_ID}/message_templates`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(
      "Template creation error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.post("/socket-message", async (req, res) => {
  try {
    // Frontend → Backend
    io.emit("incoming_message", {
      from: "server",
      text: "incoming_message Ping!",
    });
    res.json({
      from: "server",
      text: "incoming_message Ping!",
    });
  } catch (err) {
    console.error(
      "Template creation error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

server.listen(port, () => {
  console.log(`app listen port ${port}`);
});
