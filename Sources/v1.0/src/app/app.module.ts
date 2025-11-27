import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BlindsBook } from './app.component';
import { DraperyCalculator,Result } from '../pages/home/home';

@NgModule({
  declarations: [
    BlindsBook,
    DraperyCalculator,
    Result
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(BlindsBook)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    BlindsBook,
    DraperyCalculator,
    Result
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
