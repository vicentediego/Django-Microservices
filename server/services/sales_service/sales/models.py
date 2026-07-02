from django.db import models

# Create your models here.
class Sale(models.Model):
    user_id = models.IntegerField()
    product_id = models.IntegerField()
    product_name = models.CharField(
        max_length=100, default=""
    )

    quantity = models.IntegerField()

    description = models.TextField()

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    time = models.TimeField(auto_now_add=True)

    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Sale {self.id}"
