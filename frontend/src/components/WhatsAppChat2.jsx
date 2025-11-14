import axios from "axios";

export default function WhatsAppChat() {
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
      const body = {
        name: "greeting_message",
        language: "en_US",
        category: "UTILITY", //UTILITY or MARKETING
        header: "header",
        body: "body",
        footer: "footer",
      };
      const res = await axios.post(
        "http://localhost:9000/create-template",
        body
      );
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const updateTemplate = async () => {
    try {
      const body = {
        templateId: 1519749729240136,
        name: "greeting_message",
        language: "en_US",
        category: "UTILITY", //UTILITY or MARKETING
        header: "header one",
        body: "body",
        footer: "footer",
      };
      const res = await axios.post(
        "http://localhost:9000/update-template",
        body
      );
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTemplate = async () => {
    try {
      const body = {
        name: "greeting_message",
      };
      const res = await axios.post(
        "http://localhost:9000/delete-template",
        body
      );
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const getTemplates = async () => {
    try {
      const res = await axios.get("http://localhost:9000/get-templates");
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>
        <button className="button" onClick={GetApiCall}>
          Broadcast Messages Send
        </button>
        <button className="button" onClick={createTemplate}>
          Create Broadcast Messages Template
        </button>
        <button className="button" onClick={getTemplates}>
          Get Broadcast Messages Template
        </button>
        <button className="button" onClick={updateTemplate}>
          Update Broadcast Messages Template
        </button>
        <button className="button" onClick={deleteTemplate}>
          Delete Broadcast Messages Template
        </button>
      </div>
    </div>
  );
}
