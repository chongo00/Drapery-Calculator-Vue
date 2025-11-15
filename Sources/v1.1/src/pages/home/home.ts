import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss']
})
export class DraperyCalculatorPage {
  public form: FormGroup;
  public formSubmitted = false;
  
  private widthMargin = 10;
  private heightMargin = 10;
  private rfSnapSeparation = 4.25;
  private ripplefoldFullness: { [key: number]: number } = { 60: 1.8, 80: 2.0, 100: 2.2, 120: 2.4 };

  @ViewChild('error', { static: false }) error!: ElementRef;

  constructor(private formBuilder: FormBuilder, private modalCtrl: ModalController) {
    this.form = this.formBuilder.group({
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
      widthFraction: ['0'],
      heightFraction: ['0'],
      productType: ['1', Validators.required],
      fabricWidth: ['54', Validators.required],
      verticalRepeat: ['0', [Validators.required, Validators.min(0)]],
      RFFullness: ['100', Validators.required],
      PPFullness: ['2.5', Validators.required],
      return: ['0', [Validators.required, Validators.min(0)]],
      opening: ['1', Validators.required],
      railroad: ['0', Validators.required]
    });
  }

  calculate() {
    if (this.form.invalid) {
      this.formSubmitted = true;
      this.error.nativeElement.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const {
      width,
      height,
      widthFraction,
      heightFraction,
      productType,
      fabricWidth,
      verticalRepeat,
      RFFullness,
      PPFullness,
      return: returnValue,
      opening,
      railroad
    } = this.form.value;

    const nRFFullness = Number(RFFullness);
    const nPPFullness = Number(PPFullness);
    const nWidth = Number(width);
    const nHeight = Number(height);
    const nOpening = Number(opening);
    const nReturnValue = Number(returnValue);
    const nVerticalRepeat = Number(verticalRepeat);
    
    const fullness = productType === '1' ? this.ripplefoldFullness[nRFFullness] : nPPFullness;
    const fullWidth = (nWidth + parseFloat(widthFraction)) * fullness;
    const fullHeight = nHeight + parseFloat(heightFraction);

    const totalWidth = fullWidth + nOpening * (nReturnValue + this.widthMargin);
    const totalHeight = fullHeight + this.heightMargin;
    
    let fabricOrientation = 'Regular';
    let requiredWidths = Math.ceil(totalWidth / fabricWidth);
    let requiredCuts = requiredWidths;
    let requiredCutLength = totalHeight + nVerticalRepeat;
    let requiredFabric = requiredWidths * requiredCutLength;
    let requiredSnaps = 0;

    if (railroad === '1' && totalHeight < fabricWidth) {
      fabricOrientation = 'Railroad';
      requiredWidths = 1;
      requiredCuts = nOpening;
      requiredCutLength = totalWidth / nOpening;
      requiredFabric = totalWidth;
    }

    if (productType === '1') {
      requiredSnaps = nOpening * Math.ceil(fullWidth / nOpening / this.rfSnapSeparation);
    }

    this.modalCtrl.create({
      component: ResultPage,
      componentProps: {
        requiredFabric: Math.ceil(requiredFabric / 36),
        fabricWidths: requiredWidths,
        fabricCuts: requiredCuts,
        fabricCutLength: Math.floor(requiredCutLength),
        requiredSnaps,
        productType,
        fabricOrientation
      }
    }).then(modal => modal.present());
  }
}

@Component({
  selector: 'page-result',
  templateUrl: 'result.html',
  styleUrls: ['result.scss']
})
export class ResultPage {
  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
