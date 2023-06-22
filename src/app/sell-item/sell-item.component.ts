import { SellService } from './sell.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sell-item',
  templateUrl: './sell-item.component.html',
  styleUrls: ['./sell-item.component.scss'],
})
export class SellItemComponent implements OnInit {
  sellForm: FormGroup;

  constructor(private sellService: SellService) {}

  ngOnInit(): void {
    this.formInit();
  }

  private formInit() {
    this.sellForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      price: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[1-9]+[0-9]*$/),
      ]),
      rating: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-5]$/),
      ]),
      imagePath: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
    });
  }

  onSubmit() {
    this.sellService.addSellingGame(this.sellForm.value);
  }
}
