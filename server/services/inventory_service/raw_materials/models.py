from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(50)
    description = models.TextField()

    def __str__(self):
        return self.name

class Raw_material(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='raw_materials',
    )
    quantity = models.IntegerField()
    unit = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
  
class Raw_material_movement(models.Model):
    class Status(models.TextChoices):
        STOCK_IN = 'stock_in', 'entrada'
        STOCK_OUT = 'stock_out', 'salida'

    type_of = models.CharField(
        max_length=20,
        choices = Status.choices,
        default=Status.STOCK_IN,
    )

    raw_material = models.ForeignKey(
        Raw_material,
        on_delete=models.PROTECT,
        related_name='movements'
    )

    quantity = models.PositiveIntegerField()

    description = models.CharField(max_length=50)

    time = models.TimeField(auto_now_add=True)

    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'{self.raw_material} - {self.type_of}'