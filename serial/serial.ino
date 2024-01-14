#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 20, 4);

void setup() {
  // put your setup code here, to run once:
  lcd.init(); // initialize the lcd
  lcd.backlight();
  Serial.begin(9600);
  /*
  lcd.setCursor(0, 0);            // move cursor the first row
  lcd.print("mckale is cool mckale is cool");          // print message at the first row
  lcd.setCursor(0, 1);            // move cursor to the second row
  lcd.print("jessica is cool"); // print message at the second row
  lcd.setCursor(0, 2);            // move cursor to the third row
  lcd.print("carmelli is cool");          // print message at the third row
  lcd.setCursor(0, 3);            // move cursor to the fourth row
  lcd.print("woo deltahacks");   // print message the fourth row  */
pinMode(11, OUTPUT);
pinMode(12, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  if(Serial.available() > 0 ) {
      determineLines();
  }
}

void controlLCD(String line, String line2, int line_no) {
    lcd.setCursor(0, 0);
    lcd.print(line.substring(0, 20));
    lcd.setCursor(0, 1);
    lcd.print(line2.substring(2, 22));
    digitalWrite(11, HIGH);
    digitalWrite(12, HIGH);
    delay(1000);
    digitalWrite(11, LOW);
    digitalWrite(12, LOW);
    delay(3000);
    String larger;
    if (line.length() > line2.length()){
        larger = line;
    }
    else {
      larger = line2.substring(2);
    }
    if (line2.length() > 23) {
      for (int i = 0; i < larger.length(); i++) {
        lcd.setCursor(0, 0);
        lcd.print(line.substring(1+i, 21+i));
        lcd.setCursor(0, 1);
        lcd.print(line2.substring(3+i, 23+i));
        delay(300);
      }
    }
    lcd.clear();
}
void determineLines() {
  String input = Serial.readString();

  int left = 0;
  int spaces = 0;
  int line_no = 0;
  String line = "";
  String line2 = "";

  for(int right = 0; right < input.length(); right++) {
    if (input[right] == ' ') {spaces += 1;}
    else{spaces = 0;}

    if (spaces >= 3) {
      if (line_no == 0) {
        line_no = 1;
        line = input.substring(left, right);
      }
      else {
        line_no = 0;
        line2 = input.substring(left, right);
      }
      left = right;
      spaces = 0;
      
    }
  }if (line_no == 0) {
      controlLCD(line, line2, line_no);
    }}

/*  for (int right = 0; right < input.length(); ++right) {
    if (input[right] == ' ') {spaces += 1;}
    else{spaces = 0;}

    if (spaces >= 3) {
      String sub = input.substring(left, right);
      controlLCD(sub);
      left = right;
      spaces = 0;
    }
  }*/
