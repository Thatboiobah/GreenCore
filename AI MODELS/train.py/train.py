from torchvision import models
from torchvision.models import ResNet18_Weights  
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

dataset = datasets.ImageFolder("dataset/", transform=transform)
loader = DataLoader(dataset, batch_size=32, shuffle=True)


model = models.resnet18(weights=ResNet18_Weights.DEFAULT)


model.fc = nn.Linear(model.fc.in_features, len(dataset.classes))


criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

for i, (images, labels) in enumerate(loader):
    print(f"Training batch {i+1}...")

    outputs = model(images)
    loss = criterion(outputs, labels)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if i == 20:  
        break

print("Training done ")
torch.save(model.state_dict(), "plant_model.pth")
print("Model saved ")


torch.save(model.state_dict(), "plant_model.pth")
print("Model saved ")

for i, (images, labels) in enumerate(loader):
    print(f"Training batch {i+1}...")  

    outputs = model(images)
    loss = criterion(outputs, labels)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()