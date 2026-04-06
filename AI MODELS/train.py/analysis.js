// import { preview } from './dashboard.js';

const MODEL_PATH = "http://localhost:8080/model.json";

// const EXAMPLE_IMG = document.getElementById("preview"); // Image element
// if (!EXAMPLE_IMG || !EXAMPLE_IMG.complete) {
//   throw new Error("Image not found or not fully loaded");
// }
let analyzePlant = undefined;
let chatBox = document.querySelector('.chat-box')

// Class indices from the class_indices.json
const classIndices = {
    0: "Apple Applescab",
    1: "Apple___Black_rot",
    2: "Apple___Cedar_apple_rust",
    3: "Apple Healthy",
    4: "Blueberry___healthy",
    5: "Cherry_(including_sour)___Powdery_mildew",
    6: "Cherry_(including_sour)___healthy",
    7: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    8: "Corn_(maize)___Common_rust_",
    9: "Corn_(maize)___Northern_Leaf_Blight",
    10: "Corn_(maize)___healthy",
    11: "Grape___Black_rot",
    12: "Grape___Esca_(Black_Measles)",
    13: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    14: "Grape___healthy",
    15: "Orange___Haunglongbing_(Citrus_greening)",
    16: "Peach___Bacterial_spot",
    17: "Peach___healthy",
    18: "Pepper_bell___Bacterial_spot",
    19: "Pepper_bell___healthy",
    20: "Potato___Early_blight",
    21: "Potato___Late_blight",
    22: "Potato___healthy",
    23: "Raspberry___healthy",
    24: "Soybean___healthy",
    25: "Squash___Powdery_mildew",
    26: "Strawberry___Leaf_scorch",
    27: "Strawberry___healthy",
    28: "Tomato___Bacterial_spot",
    29: "Tomato___Early_blight",
    30: "Tomato___Late_blight",
    31: "Tomato___Leaf_Mold",
    32: "Tomato___Septoria_leaf_spot",
    33: "Tomato___Spider_mites Two-spotted_spider_mite",
    34: "Tomato___Target_Spot",
    35: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    36: "Tomato___Tomato_mosaic_virus",
    37: "Tomato___healthy"
};

// Plant type mapping
const plantTypes = {
    "Apple": ["Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple Healthy"],
    "Blueberry": ["Blueberry___healthy"],
    "Cherry": ["Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy"],
    "Corn": ["Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy"],
    "Grape": ["Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy"],
    "Orange": ["Orange___Haunglongbing_(Citrus_greening)"],
    "Peach": ["Peach___Bacterial_spot", "Peach___healthy"],
    "Pepper_bell": ["Pepper_bell___Bacterial_spot", "Pepper_bell___healthy"],
    "Potato": ["Potato___Early_blight", "Potato___Late_blight", "Potato___healthy"],
    "Raspberry": ["Raspberry___healthy"],
    "Soybean": ["Soybean___healthy"],
    "Squash": ["Squash___Powdery_mildew"],
    "Strawberry": ["Strawberry___Leaf_scorch", "Strawberry___healthy"],
    "Tomato": [
        "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
        "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
        "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
    ]
};

const plantRecommendations = {
    "Apple Applescab": [
        "Apply fungicides like captan or mancozeb to control apple scab. For more information: https://www.gardeningknowhow.com/edible/fruits/apples/"
    ],
    "Apple Black rot": [
        "Prune and remove all infected branches and fruits.",
    ],
    "Apple Cedar apple rust": [
        "Use fungicides like myclobutanil or mancozeb to prevent cedar apple rust. For more information: https://www.gardeningknowhow.com/edible/fruits/apples"
    ],
    "Apple Healthy": [
        "Regular pruning to improve airflow and light penetration. For more information: https://www.gardeningknowhow.com/edible/fruits/apples"
    ],
    "Blueberry Healthy": [
        "Keep the soil moist but well-drained for optimal growth. For more information: https://www.gardeningknowhow.com/edible/fruits/blueberry"
    ],
    "Cherry (including sour) Powdery mildew": [
        "Apply a fungicide to control powdery mildew in cherry trees. For more information: https://www.gardeningknowhow.com/edible/fruits/cherry"
    ],
    "Cherry (including sour) Healthy": [
        "Ensure proper watering and pruning for a healthy cherry tree. For more information: https://www.gardeningknowhow.com/edible/fruits/cherry"
    ],
    "Corn (maize) Cercospora leaf spot Gray leaf spot": [
        "Use fungicides like azoxystrobin or pyraclostrobin to control gray leaf spot. For more information: https://www.gardeningknowhow.com/edible/grains/corn"
    ],
    "Corn (maize) Common rust": [
        "Apply fungicides at the early stages of rust development."
    ],
    "Corn (maize) Northern Leaf Blight": [
        "Use resistant corn hybrids to prevent northern leaf blight. For more information: https://www.gardeningknowhow.com/edible/grains/corn/"
    ],
    "Corn (maize) Healthy": [
        "Ensure proper fertilization and watering for healthy corn plants. For more information: https://www.gardeningknowhow.com/edible/grains/corn"
    ],
    "Grape Black rot": [
        "Use fungicide sprays to control black rot in grapes."],
    "Grape Esca (Black Measles)": [
        "Prune infected wood to prevent the spread of esca in grapevines. For more information: https://www.gardeningknowhow.com/edible/fruits/grapes"
    ],
    "Grape Leaf blight (Isariopsis Leaf Spot)": [
        "Apply copper-based fungicides to control leaf blight in grapes.",
        "For more information: https://www.gardeningknowhow.com/edible/fruits/grapes/grape-leaf-blight-treatment.htm"
    ],
    "Grape Healthy": [
        "Prune regularly and water consistently to ensure healthy grape growth.",
        "For more information: https://www.gardeningknowhow.com/edible/fruits/grapes/growing-grape-vines.htm"
    ],
    "Orange Haunglongbing (Citrus greening)": [
        "Remove infected trees to prevent the spread of the disease.",
        "For more information: https://www.gardeningknowhow.com/edible/fruits/orange/citrus-greening.htm"
    ],
    "Peach Bacterial spot": [
        "Use copper-based sprays during the growing season to control bacterial spot.",
        "For more information: https://extension.psu.edu/peach-disease-bacterial-spot"
    ],
    "Peach Healthy": [
        "Maintain proper watering and pruning to promote healthy growth.",
        "For more information: https://www.gardeningknowhow.com/edible/fruits/peach/growing-peach-trees.htm"
    ],
    "Pepper bell Bacterial spot": [
        "Use disease-free seeds and resistant pepper varieties.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/pepper/pepper-bacterial-spot-treatment.htm"
    ],
    "Pepper bell Healthy": [
        "Ensure proper watering and nutrient balance for healthy pepper plants.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/pepper/growing-bell-peppers.htm"
    ],
    "Potato Early blight": [
        "Remove affected leaves and avoid overhead watering.",
        "For more information: https://extension.umn.edu/potato-diseases/early-blight-potato"
    ],
    "Potato Late blight": [
        "Use fungicides like chlorothalonil to prevent late blight.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/potato/treating-late-blight-in-potatoes.htm"
    ],
    "Potato Healthy": [
        "Maintain proper soil moisture and fertilization for healthy potato plants.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/potato/growing-potatoes.htm"
    ],
    "Raspberry Healthy": [
        "Mulch regularly to retain moisture and suppress weeds.",
        "For more information: https://www.gardeningknowhow.com/edible/fruits/raspberry/growing-raspberry-plants.htm"
    ],
    "Soybean Healthy": [
        "Plant soybeans in well-drained soil to prevent root diseases.",
        "For more information: https://extension.umn.edu/soybean-planting/soybean-production"
    ],
    "Squash Powdery mildew": [
        "Apply sulfur-based fungicides to control powdery mildew.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/squash/powdery-mildew-on-squash.htm"
    ],
    "Strawberry Leaf scorch": [
        "Remove infected leaves to control the spread of the disease.",
        "For more information: https://extension.psu.edu/strawberry-disease-leaf-scorch"
    ],
    "Strawberry Healthy": [
        "Provide proper irrigation and mulch to promote healthy strawberries.",
        "For more information: https://www.gardeningknowhow.com/edible/fruits/strawberry/growing-strawberry-plants.htm"
    ],
    "Tomato Bacterial spot": [
        "Remove infected plants to prevent the spread of the disease.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-bacterial-spot-treatment.htm"
    ],
    "Tomato Early blight": [
        "Remove infected leaves to slow the spread of the disease.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-early-blight-control.htm"
    ],
    "Tomato Late blight": [
        "Apply fungicides such as chlorothalonil or copper.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/late-blight-treatment.htm"
    ],
    "Tomato Leaf Mold": [
        "Remove lower leaves to improve airflow and prevent mold.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-leaf-mold.htm"
    ],
    "Tomato Septoria leaf spot": [
        "Use resistant tomato varieties and apply fungicides.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-septoria-leaf-spot-treatment.htm"
    ],
    "Tomato Spider mites Two-spotted spider mite": [
        "Spray plants with water to knock off the mites.",
        "For more information: https://www.gardeningknowhow.com/plant-problems/pests/insects/spider-mite-control.htm"
    ],
    "Tomato Target Spot": [
        "Use fungicides to treat and prevent target spot.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-target-spot.htm"
    ],
    "Tomato Tomato Yellow Leaf Curl Virus": [
        "Control whiteflies, which spread the virus.",
        "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-yellow-leaf-curl.htm"
    ],
    "Tomato Tomato mosaic virus": [
            "Use resistant tomato varieties and practice crop rotation.",
            "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/tomato-mosaic-virus.htm"
        ],
    "Tomato Healthy": [
            "Ensure proper watering and nutrient management.",
            "For more information: https://www.gardeningknowhow.com/edible/vegetables/tomato/growing-tomatoes.htm"
        ]
    };
// Function to get the plant type based on the predicted condition
function getPlantType(predictedClass) {
    for (let plant in plantTypes) {
        if (plantTypes[plant].includes(predictedClass)) {
            return plant;  // Return the plant type (e.g., "Apple", "Tomato")
        }
    }
    return "Unknown Plant Type";
}

// Function to get recommendations based on predicted disease
function getRecommendations(predictedClass) {
    return plantRecommendations[predictedClass] || ["No recommendations available."];
}

// Replace underscores in classIndices
for (const index in classIndices) {
    classIndices[index] = classIndices[index].replace(/_/g, ' ');
}

// Replace underscores in plantTypes
for (const plant in plantTypes) {
    plantTypes[plant] = plantTypes[plant].map(type => type.replace(/_/g, ' '));
}



async function loadAndRunModel(imageElement) {
    try {
        // Load the model
        console.log('starting model...')
        analyzePlant = await tf.loadLayersModel(MODEL_PATH);
        console.log("Model loaded successfully");
          
          console.log('getting tensorImg');
          
          
        // Convert the image to a tensor
        let tensorImg = tf.browser.fromPixels(imageElement);
        console.log('Original Image Shape:', tensorImg.shape); // e.g., [height, width, channels]

        // Resize the image to 224x224 pixels
        const resizedImg = tf.image.resizeBilinear(tensorImg, [224, 224], true).toInt();

        // Normalize the image to have pixel values in the range [0, 1]
        const normalizedImg = resizedImg.div(255.0);  // Normalize pixel values

        // Add a batch dimension to make the tensor shape [1, 224, 224, 3]
        const batchedImg = normalizedImg.expandDims(0);  // Shape: [1, 224, 224, 3]
        
       console.log('getting prediction...')
        // Run the model on the preprocessed image
        const prediction = analyzePlant.predict(batchedImg);

        // Extract and log prediction data
       // Get the predicted probabilities
        const probabilities = prediction.dataSync();  // Get the probabilities array
        console.log('Prediction Probabilities:', probabilities);

        // Get the predicted class index (the index of the highest probability)
        const predictedIndex = prediction.argMax(1).dataSync()[0];

        // Get the confidence score for the predicted class
        const confidenceScore = probabilities[predictedIndex] * 100;  // Convert to percentage
        console.log('Predicted Class Index:', predictedIndex);
        console.log('Confidence Score:', confidenceScore.toFixed(2), '%');

        // If the confidence score is less than 20%, output "Unknown"
        if (confidenceScore < 20) {
            console.log('Predicted Class: Unknown');
            document.getElementById("plant-type").innerText = "Unknown";
            document.getElementById("health-status").innerText = "Unknown";
            document.getElementById("recommendation").innerText = "No recommendations available for unknown condition.";
        } else {
            // Map the predicted index to the corresponding class label
            const predictedClass = classIndices[predictedIndex];
            console.log('Predicted Class:', predictedClass);

            // Get the plant type based on the predicted condition
            const plantType = getPlantType(predictedClass);
            console.log('Predicted Plant Type:', plantType);

            // Get recommendations for the predicted class
            const recommendations = getRecommendations(predictedClass).join('<br>');

            // Display the result in the UI
            const aiMessage = document.createElement('div');
            aiMessage.classList.add('chat-message', 'ai-message');
            aiMessage.innerHTML = `<p>Predicted plant type: ${ plantType }, ${ predictedClass }, ${ recommendations } </p>`;
            chatBox.appendChild(aiMessage);
            
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll chat to bottom
        }
        

    } catch (error) {
        console.error("Error loading or running the model:", error);
    } finally {
      // Clean up tensors
      if (tensorImg) tensorImg.dispose();
      if (resizedImg) resizedImg.dispose();
      if (normalizedImg) normalizedImg.dispose();
      if (batchedImg) batchedImg.dispose();
    }
}
  


const startAnalysisBtn = document.querySelector(".start-analysis-btn");
const loadingAnimation = document.getElementById("loading-animation");
const resultSection = document.querySelector(".results-section");

// Function to analzye image

export async function analyzeImage(imageData) {
  try {
    if (!imageData || !imageData.element) {
      throw new Error("Invalid image data for analysis");
    }

    const aiMessage = document.createElement('div');
    aiMessage.classList.add('chat-message', 'ai-message');
    aiMessage.innerHTML = `<p>Analyzing your image... please wait.</p>`;
    chatBox.appendChild(aiMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Call the function to load the model and predict
    await loadAndRunModel(imageData.element);

  } catch (error) {
    console.error("Error during analysis:", error);

    // Display error message to user
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('chat-message', 'ai-message');
    errorMessage.innerHTML = `<p>Error: ${error.message}</p>`;
    chatBox.appendChild(errorMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
} 
// Event listener for the "Start Analysis" button
// startAnalysisBtn.addEventListener("click", analyzeImage);
