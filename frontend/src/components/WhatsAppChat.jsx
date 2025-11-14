import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:9000", {
  transports: ["websocket"],
});
const initialTemplate = {
  id: 0,
  name: "",
  header: "",
  body: "",
  footer: "",
};
export default function WhatsAppChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [template, setTemplate] = useState(initialTemplate);
  const [allTemplate, setAllTemplate] = useState([]);

  useEffect(() => {
    console.log("socket initialized");

    const onConnect = () => {
      console.log("Connected:", socket.id);
    };

    const onPrev = (msg) => {
      console.log("previous_messages", msg);
    };

    const onIncoming = (msg) => {
      console.log("Incoming:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("connect", onConnect);
    socket.on("previous_messages", onPrev);
    socket.on("incoming_message", onIncoming);

    return () => {
      socket.off("connect", onConnect);
      socket.off("previous_messages", onPrev);
      socket.off("incoming_message", onIncoming);
    };
  }, []);

  const sendMessage = () => {
    setMessages((prev) => [
      ...prev,
      {
        from: "client",
        text: input,
      },
    ]);
    socket.emit("send_message", {
      to: "916361849001", // customer number
      message: input,
    });
    setInput("");
  };

  const sendSocketMessage = async () => {
    setMessages((prev) => [
      ...prev,
      {
        from: "client",
        text: input,
      },
    ]);
    try {
      const res = await axios.post("http://localhost:9000/socket-message", {});
      console.log(res);
      setInput("");
    } catch (error) {
      console.log(error);
    }
  };

  const GetApiCall = async () => {
    try {
      const res = await axios.post("http://localhost:9000/message", {});
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const createTemplate = async () => {
    try {
      // const body = {
      //   name: "admission_update_notice_one",
      //   language: "en_US",
      //   category: "UTILITY", //UTILITY or MARKETING
      //   header: "Admission Update",
      //   body: "Your admission has been confirmed. Your reporting date is {{1}} at {{2}}. Please carry your ID card and required documents.",
      //   footer: "School Notice",
      // };

      const body = {
        name: template.name,
        language: "en_US",
        category: "UTILITY", //UTILITY or MARKETING
        header: template.name,
        body: template.body,
        footer: template.footer,
      };
      const res = await axios.post(
        "http://localhost:9000/create-template",
        body
      );
      console.log(res);
      setTemplate(initialTemplate);
    } catch (error) {
      console.log(error);
    }
  };

  const updateTemplate = async () => {
    try {
      // const body = {
      //   templateId: 2102216863519529,
      //   name: "admission_update_notice",
      //   language: "en_US",
      //   category: "UTILITY", //UTILITY or MARKETING
      //   header: "Admission Update",
      //   body: "Your admission one has been confirmed. Your reporting date is {{1}} at {{2}}. Please carry your ID card and required documents.",
      //   footer: "School Notice",
      // };

      const body = {
        templateId: template.id,
        name: template.name,
        language: "en_US",
        category: "UTILITY", //UTILITY or MARKETING
        header: template.name,
        body: template.body,
        footer: template.footer,
      };
      const res = await axios.post(
        "http://localhost:9000/update-template",
        body
      );
      console.log(res);
      setTemplate(initialTemplate);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTemplate = async () => {
    try {
      const body = {
        name: template.name,
      };
      const res = await axios.post(
        "http://localhost:9000/delete-template",
        body
      );
      console.log(res);
      setTemplate(initialTemplate);
    } catch (error) {
      console.log(error);
    }
  };

  const getTemplates = async () => {
    try {
      const res = await axios.get("http://localhost:9000/get-templates");
      console.log(res);
      if (res.data && res.data.data) setAllTemplate(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(allTemplate);
  return (
    <div>
      <div>
        <div className="inputForm">
          <h3>Broadcast Messages Send</h3>
          <button className="button" onClick={GetApiCall}>
            Broadcast Messages Send
          </button>
        </div>

        <div className="inputForm">
          <h3>Create Template</h3>
          <div>
            <input
              className="input"
              value={template.name}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  name: e.target.value,
                })
              }
              placeholder="Type a Template Name..."
            />
            <input
              className="input"
              value={template.header}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  header: e.target.value,
                })
              }
              placeholder="Type a header..."
            />
            <input
              className="input"
              value={template.body}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  body: e.target.value,
                })
              }
              placeholder="Type a body..."
              required
            />
            <input
              className="input"
              value={template.footer}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  footer: e.target.value,
                })
              }
              placeholder="Type a footer..."
            />
          </div>

          <button className="button" onClick={createTemplate}>
            Create Broadcast Messages Template
          </button>
        </div>
        <div className="inputForm">
          <h3>Update Template</h3>
          <div>
            <input
              className="input"
              value={template.id}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  id: e.target.value,
                })
              }
              placeholder="Type a Template Id..."
              required
            />
            <input
              className="input"
              value={template.name}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  name: e.target.value,
                })
              }
              placeholder="Type a Template Name..."
            />
            <input
              className="input"
              value={template.header}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  header: e.target.value,
                })
              }
              placeholder="Type a header..."
            />
            <input
              className="input"
              value={template.body}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  body: e.target.value,
                })
              }
              placeholder="Type a body..."
              required
            />
            <input
              className="input"
              value={template.footer}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  footer: e.target.value,
                })
              }
              placeholder="Type a footer..."
            />
          </div>
          <button className="button" onClick={updateTemplate}>
            Update Broadcast Messages Template
          </button>
        </div>

        <div className="inputForm">
          <h3>Templates</h3>
          <div>
            {allTemplate &&
              allTemplate.map((item) => {
                return (
                  <div className="templateCard">
                    <div>
                      <b>Id</b>: <span>{item.id}</span>
                    </div>
                    <div>
                      <b>Name</b>: <span>{item.name}</span>
                    </div>
                    <div>
                      <b>Category</b>: <span>{item.category}</span>
                    </div>
                    <div>
                      <b>Status</b>: <span>{item.status}</span>{" "}
                    </div>
                  </div>
                );
              })}
          </div>

          <button className="button" onClick={getTemplates}>
            Get Broadcast Messages Template
          </button>
        </div>

        <div className="inputForm">
          <h3>Delete Template</h3>
          <input
            className="input"
            value={template.name}
            onChange={(e) =>
              setTemplate({
                ...template,
                name: e.target.value,
              })
            }
            placeholder="Type a Template Name..."
            required
          />
          <button className="button" onClick={deleteTemplate}>
            Delete Broadcast Messages Template
          </button>
        </div>
      </div>
      <div className="p-4">
        <h2> WhatsApp Live Chat</h2>
        <div
          style={{ border: "1px solid #ccc", height: 300, overflowY: "auto" }}
        >
          {messages.map((m, i) => (
            <div key={i}>
              <div
                className={
                  m.from === "client" ? "clientMessage" : "clientServer"
                }
              >
                <div className="message">
                  <b>{m.from}</b>: {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="button" onClick={sendMessage}>
          Send
        </button>

        <button className="button" onClick={sendSocketMessage}>
          Socket Message Send
        </button>
      </div>
    </div>
  );
}
