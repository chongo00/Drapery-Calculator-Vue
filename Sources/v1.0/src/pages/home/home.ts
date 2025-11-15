import { Component, ViewChild,ElementRef  } from '@angular/core';
import { Validators, FormBuilder,AbstractControl } from '@angular/forms';
import { NavController,ModalController,NavParams,ViewController,Content } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class DraperyCalculator {

  public form;
  public formSubmitted = false;
  public width: AbstractControl;
  public height: AbstractControl;
  public widthFraction: AbstractControl;
  public heightFraction: AbstractControl;
  public productType : AbstractControl;
  public fabricWidth : AbstractControl;
  public verticalRepeat : AbstractControl;
  public RFFullness : AbstractControl;
  public PPFullness : AbstractControl;
  public return : AbstractControl;
  public opening : AbstractControl;
  public railroad : AbstractControl;
    
  private widthMargin = 10;
  private heightMargin = 10;
  private rfSnapSeparation = 4.25;
  private ripplefoldFullness60 = 1.8;
  private ripplefoldFullness80 = 2.0;
  private ripplefoldFullness100 = 2.2;
  private ripplefoldFullness120 = 2.4;

  @ViewChild("error", {read: ElementRef}) error: ElementRef;
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private formBuilder: FormBuilder ) {
    

      this.form = this.formBuilder.group({
        width: ['', Validators.compose([Validators.required, Validators.min(1)])],
        height: ['', Validators.compose([Validators.required, Validators.min(1)])],
        widthFraction: ['0'],
        heightFraction: ['0'],
        productType :  ['1', Validators.required],
        fabricWidth : ['54', Validators.required],
        verticalRepeat : ['0', Validators.compose([Validators.required, Validators.min(0)])],
        RFFullness :  ['100', Validators.required],
        PPFullness : ['2.5', Validators.required],
        return : ['0', Validators.compose([Validators.required, Validators.min(0)])],
        opening : ['1', Validators.required],
        railroad : ['0', Validators.required]
      });

      this.width = this.form.controls.width;
      this.widthFraction = this.form.controls.widthFraction;
      this.height = this.form.controls.height;
      this.heightFraction = this.form.controls.heightFraction;
      this.productType = this.form.controls.productType;
      this.fabricWidth = this.form.controls.fabricWidth;
      this.verticalRepeat = this.form.controls.verticalRepeat;
      this.RFFullness = this.form.controls.RFFullness;
      this.PPFullness = this.form.controls.PPFullness;
      this.return = this.form.controls.return;
      this.opening = this.form.controls.opening;
      this.railroad = this.form.controls.railroad;
  }

  Calculating() {
    var _panels: number;
    _panels = this.opening.value;
  
    var _fullness : number;
    if(this.productType.value == 1) {
      if(this.RFFullness.value == "60"){
        _fullness = this.ripplefoldFullness60;
      }
      if(this.RFFullness.value == "80") {
        _fullness = this.ripplefoldFullness80;
      }
      if(this.RFFullness.value == "100") {
        _fullness = this.ripplefoldFullness100;
      }
      if(this.RFFullness.value == "120") {
        _fullness = this.ripplefoldFullness120;
      }
    } else {
      _fullness = this.PPFullness.value;
    }

    var _totalHeight = (+this.height.value + parseFloat(this.heightFraction.value)) + (+this.heightMargin);
    var _totalWidth  = ((+this.width.value + parseFloat(this.widthFraction.value)) * _fullness) + (+_panels) * (+this.return.value + +this.widthMargin);

    var _requiredWidths, 
        _requiredFabric, 
        _requiredCutLength, 
        _requiredCuts, 
        _fabricOrientation;

    if((this.railroad.value == 1) && (_totalHeight < this.fabricWidth.value)) {
      _fabricOrientation = "Railroad";
      _requiredWidths = 1;
      _requiredCuts = _panels;
      _requiredCutLength = (_totalWidth / _panels);
      _requiredFabric = _totalWidth;
    } else {
      _fabricOrientation = "Regular";
      _requiredWidths = Math.ceil((_totalWidth / this.fabricWidth.value));
      _requiredCuts = _requiredWidths;
      _requiredCutLength = (+_totalHeight + +this.verticalRepeat.value);
      _requiredFabric = (_requiredWidths * _requiredCutLength);
    };
    
    var _requiredSnaps;
    if(this.productType.value == 1) {
      _requiredSnaps = _panels * Math.ceil(((+this.width.value + parseFloat(this.widthFraction.value)) * _fullness / _panels) / this.rfSnapSeparation);
    } else {
      _requiredSnaps = 0;
    }

    let resultModal = this.modalCtrl.create(Result, { 
        requiredFabric:  Math.ceil(_requiredFabric / 36),
        fabricWidths: _requiredWidths,
        fabricCuts: _requiredCuts,
        fabricCutsFraction : this.ParseDecimalToFraction(_requiredCutLength) === "1" ? "" : this.ParseDecimalToFraction(_requiredCutLength),
        fabricCutLength: this.ParseDecimalToFraction(_requiredCutLength) === "1" ? Math.floor(_requiredCutLength + 1) : Math.floor(_requiredCutLength),
        requiredSnaps: _requiredSnaps,
        productType : this.productType.value,
        fabricOrientation : _fabricOrientation,
        width : this.width.value, 
        widthFraction: this.ParseStringToFraction(this.widthFraction.value),
        height : this.height.value,
        heightFraction : this.ParseStringToFraction(this.heightFraction.value),
        fullness : this.productType.value == 2 ? this.PPFullness.value : this.RFFullness.value + "%"
      });

    resultModal.present();
  }

  CalculatorForm() {
    this.formSubmitted = true;
    if(this.form.valid) {
      this.Calculating();
    } else {
      this.content.scrollTo(0,this.error.nativeElement.offsetTop);
      this.form.controls.width.touched = true;
      this.form.controls.height.touched = true;
      this.form.controls.productType.touched = true;
      this.form.controls.fabricWidth.touched = true;
      this.form.controls.verticalRepeat.touched = true;
      this.form.controls.RFFullness.touched = true;
      this.form.controls.PPFullness.touched = true;
      this.form.controls.return.touched = true;
      this.form.controls.opening.touched = true;
      this.form.controls.railroad.touched = true;
      this.form.touched = true;
    }
  }

  ParseDecimalToFraction(number) {
    var integerValue = Math.floor(number);
    var fractionValue = number - integerValue;
    var fraction = "";
    if (fractionValue >= 0 && fractionValue <= 0.0625) {
      fraction = "";
    } else if (fractionValue > 0.0625 && fractionValue <= 0.1875) {
      fraction = "1/8";
    } else if (fractionValue > 0.1875 && fractionValue <= 0.3125) {
      fraction = "1/4";
    } else if (fractionValue > 0.3125 && fractionValue <= 0.4375) {
      fraction = "3/8";
    } else if (fractionValue > 0.4375 && fractionValue <= 0.5625) {
      fraction = "1/2";
    } else if (fractionValue > 0.5625 && fractionValue <= 0.6875) {
      fraction = "5/8";
    } else if (fractionValue > 0.6875 && fractionValue <= 0.8125) {
      fraction = "3/4";
    } else if (fractionValue > 0.8125 && fractionValue <= 0.9375) {
      fraction = "7/8";
    } else { 
      fraction = "1";
    }
    return fraction;
  }

  ParseStringToFraction(value) : string {
    switch(value) {
      case "0.125": { 
        return "1/8";
      }
      case "0.25": { 
        return "1/4";
      }
      case "0.375": { 
        return "3/8";
      }
      case "0.5": { 
        return "1/2";
      }
      case "0.625": { 
        return "5/8";
      }
      case "0.75": { 
        return "3/4";
      }
      case "0.875": { 
        return "7/8";
      }
    }
  }
}

@Component({
  selector: 'page-result',
  templateUrl: 'result.html'
})
export class Result {

  public requiredFabric;
  public fabricWidths;
  public fabricCuts;
  public fabricCutsFraction;
  public fabricCutLength
  public requiredSnaps
  public productType;
  public fabricOrientation;
  public width;
  public height;
  public widthFraction;
  public heightFraction;
  public fullness;

  constructor(params: NavParams,public viewCtrl: ViewController) {
    this.requiredFabric =  params.get('requiredFabric');
    this.fabricWidths =  params.get('fabricWidths');
    this.fabricCuts =  params.get('fabricCuts');
    this.fabricCutsFraction = params.get('fabricCutsFraction');
    this.fabricCutLength =  params.get('fabricCutLength');
    this.requiredSnaps =  params.get('requiredSnaps');
    this.productType =  params.get('productType');
    this.fabricOrientation =  params.get('fabricOrientation');
    this.width =  params.get('width');
    this.height =  params.get('height');
    this.widthFraction =  params.get('widthFraction');
    this.heightFraction =  params.get('heightFraction');
    this.fullness = params.get('fullness');
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}


