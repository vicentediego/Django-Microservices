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


class ProductMovement(models.Model):
    class Status(models.TextChoices):
        STOCK_IN = 'stock_in', 'entrada'
        STOCK_OUT = 'stock_out', 'salida'

    type_of = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.STOCK_OUT,
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='movements'
    )

    quantity = models.PositiveIntegerField()

    description = models.CharField(
        max_length=50,
        default='venta'
    )

    time = models.TimeField(auto_now_add=True)

    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'{self.product} - {self.type_of}'
