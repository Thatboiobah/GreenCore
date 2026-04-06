from PIL import Image
import torch
import torchvision.transforms as transforms
import torch.nn.functional as F
from torchvision.models import resnet18, ResNet18_Weights


model = resnet18(weights=ResNet18_Weights.DEFAULT)
model.fc = torch.nn.Linear(model.fc.in_features, 1)
model.load_state_dict(torch.load("plant_model.pth", map_location="cpu"))
model.eval()


image_path = "tomatoe.jpg"  
image = Image.open(image_path).convert("RGB")  


preprocess = transforms.Compose([
    transforms.Resize((224, 224)),   
    transforms.ToTensor(),           
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

image_tensor = preprocess(image)
image_tensor = image_tensor.unsqueeze(0) 

with torch.no_grad():
    output = model(image_tensor)
    prob = torch.sigmoid(output)

    print("Raw output:", output.item())
    print("Sigmoid probability:", prob.item())

    if prob.item() > 0.5:
        print("Prediction: Diseased 🍂")
    else:
        print("Prediction: Healthy 🌿")