from django.db import models

# Create your models here.
class Category(models.Model):

    name= models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name
    
class Product(models.Model):

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.IntegerField(default=0)

    min_stock = models.IntegerField(default=5)

    created_at = models.TimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name