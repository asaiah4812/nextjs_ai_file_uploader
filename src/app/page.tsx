"use client"
import Image from "next/image";
import { ChangeEvent,  FormEvent,  useState} from "react";


export default function Home() {
  const [ image, setImage ] = useState<string>("");
  const [ openAIResponse, setOpenAIResponse ] = useState<string>("");
  // useState to hold a base64 string.
  // useState to hold the chatGPT response

  // Image upload logic
  // 1. User upload an image
  // 2. We can take the image (all of its data), and convert it into a base64 string
  // What is a base64 string? It is a string "AJADLSDJAK" that represents an ENTIRE image.
  // "ENTIRESTRING" -> :)
  // 3. When we request the API route we create, we will pass the image (string) to the backend.

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if(event.target.files === null) {
      window.alert("No file selected. Choose a file.")
      return;
    }
    const file = event.target.files[0];

    // Convert the users file (locally on their computer) to a base64 string
    // FileReader
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      // reader.result -> base64 string ("ENTIRESTRING" -> :))
      if(typeof reader.result === "string") {
        console.log(reader.result);
        setImage(reader.result);
      }
    }

    reader.onerror = (error) => {
      console.log("error: " + error);
    }

  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(image === "") {
      alert("Upload an image.")
      return;
    }

    // POST api/analyzeImage
    await fetch("api/analyzeImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: image // base64 image
      })
    })
    .then(async (response: any) => {
      // Because we are getting a streaming text response
      // we have to make some logic to handle the streaming text
      const reader = response.body?.getReader();
      setOpenAIResponse("");
      // reader allows us to read a new piece of info on each "read"
      // "Hello" + "I am" + "Cooper Codes"  reader.read();
      while (true) {
        const { done, value } = await reader?.read();
        // done is true once the response is done
        if(done) {
          break;
        }

        // value : uint8array -> a string.
        var currentChunk = new TextDecoder().decode(value);
        setOpenAIResponse((prev) => prev + currentChunk);
      }
    });

  }
  return (
    <div className="min-h-screen flex items-center justify-center text-md">
      <div className="bg-slate-800 w-full max-w-2xl rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold md-4">Uploaded Image</h2>
        { image !== "" ? 
          <div className="mb-4 overflow-hidden">
            <Image 
            src={image}
            width={300}
            height={300}
            alt="image"
            className="w-full object-contain max-h-72"
            />
          </div>
        :
        <div className="mb-4 p-8 text-center">
          <p>Once you upload an image, you will see it here.</p>
        </div>
      }
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="flex flex-col mb-6">
            <label htmlFor="file" className="md-2 text-sm font-medium">Upload Image</label>
            <input 
            onChange={(e) => handleFileChange(e)}
            type="file" 
            id="file" 
            className="text-sm border rounded-lg" />
          </div>
          <div className="flex justify-center">
            <button title="ask" type="submit" className="p-2 bg-sky-600 rounded-md mb-4">
              Ask ChatGPT To Analyze Your Image
            </button>
          </div>
        </form>
        {openAIResponse !== "" ? 
        <div className="border-t border-gray-300 pt-4">
          <h2 className="text-xl font-bold mb-2">AI Response</h2>
          <p>{openAIResponse}</p>
        </div>
        : 
        null
        }
      </div>
    </div>
  );
}
