#include "MIRremote.h"

// To support more than 5 receivers, remember to change the define
// IR_PARAMS_MAX in MIRremoteInt.h as well.
// Arduino Nano tested to 4 receivers, more than that might need better processor
#define RECEIVERS 3


IRrecv *irrecvs[RECEIVERS];

unsigned long racers[64] = {0};
unsigned long lastScan[64] = {0};

decode_results results;

void setup()
{
  Serial.begin(9600);

 // 10 and 11 work on nano
  irrecvs[0] = new IRrecv(2); // Receiver #0: pin 2
  irrecvs[1] = new IRrecv(3); // Receiver #1: pin 3
  irrecvs[2] = new IRrecv(4); // Receiver #2: pin 4
  //irrecvs[3] = new IRrecv(5); // Receiver #3: pin 5
  //irrecvs[4] = new IRrecv(6); // Receiver #4: pin 6

  for (int i = 0; i < RECEIVERS; i++)
    irrecvs[i]->enableIRIn();
}

void addTime(long id)
{
  unsigned long curTime = millis();
  unsigned long last = curTime - lastScan[id];
  if(last > 2000)
   {
     // Format racer,id,laptime,lastScan,CurScan
     Serial.print("Racer,");
     Serial.print(id); Serial.print(",");
     unsigned long lapTime = curTime-racers[id];
     Serial.print(lapTime); Serial.print(",");
     Serial.print(racers[id]); Serial.print(",");
     Serial.print(curTime); Serial.println("");
     
     racers[id]=curTime;
   } 
   lastScan[id]=curTime;
}

void loop() {
  for (int i = 0; i < RECEIVERS; i++)
  {
    if (irrecvs[i]->decode(&results))
    {
      /*Serial.print("Receiver #");
      Serial.print(i);
      Serial.print(":");
      Serial.print(results.value);
      Serial.print(" ");
      Serial.println(millis());*/
      addTime(results.value);
      irrecvs[i]->resume();
    }
  }
}
