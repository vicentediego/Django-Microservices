from django.db import models

# Create your models here.
class Sale(models.Model):
    user_id = models.IntegerField()
    product_id = models.IntegerField()

    quantity = models.IntegerField()

    description = models.TextField()

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Sale (self.id)"
    