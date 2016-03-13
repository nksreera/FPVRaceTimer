#include "MIRremote.h"
#include "MIRremoteInt.h"

//==============================================================================
//                           N   N  EEEEE   CCCC
//                           NN  N  E      C
//                           N N N  EEE    C
//                           N  NN  E      C
//                           N   N  EEEEE   CCCC
//==============================================================================

#define NEC_BITS          32
#define NEC_HDR_MARK    9000
#define NEC_HDR_SPACE   4500
#define NEC_BIT_MARK     560
#define NEC_ONE_SPACE   1690
#define NEC_ZERO_SPACE   560
#define NEC_RPT_SPACE   2250

//+=============================================================================
#if SEND_NEC
void  IRsend::sendNEC (unsigned long data,  int nbits)
{
	// Set IR carrier frequency
	enableIROut(38);

	// Header
	mark(NEC_HDR_MARK);
	space(NEC_HDR_SPACE);

	// Data
	for (unsigned long  mask = 1UL << (nbits - 1);  mask;  mask >>= 1) {
		if (data & mask) {
			mark(NEC_BIT_MARK);
			space(NEC_ONE_SPACE);
		} else {
			mark(NEC_BIT_MARK);
			space(NEC_ZERO_SPACE);
		}
	}

	// Footer
	mark(NEC_BIT_MARK);
	space(0);  // Always end with the LED off
}
#endif

//+=============================================================================
// NECs have a repeat only 4 items long
//
#if DECODE_NEC
bool  IRrecv::decodeNEC (decode_results *results)
{
  long data = 0;
  if (irparams.rawlen < 10) {
    //Serial.println("error at length " + irparams.rawlen);
    return false;
  }
  
  /*
  // check buffer at position 0
  if(results->rawbuf[0]<25)
  {
    return false;
  }*/
  
  unsigned int num_one_pulses=0;
  
  // check header position 1 and 2
  if(!(MATCH(results->rawbuf[1], 300) && MATCH(results->rawbuf[2], 300)))
  {
    // Error no zero zero header found
    //Serial.println("bad header");
    return false;
  }
   for(int i=3;i<9;i++)
   {
     // Serial.print(results->rawbuf[i]);
     // Serial.print(", ");
     if(MATCH(results->rawbuf[i], 600))
     {
       // Serial.print(" One");
       data = (data << 1) | 1;
       num_one_pulses++;
     }
     else if(MATCH(results->rawbuf[i], 300))
     {
       // Serial.print(" Zero");
       data <<= 1;
     }
     else
     {
       // Serial.print(" ");
       // Serial.print(results->rawbuf[i]);
       return false;
     }
   }
   
   // check checksum
   if(num_one_pulses % 2 == 1 && MATCH(results->rawbuf[9],300))
   {
     return false;
     //Serial.println("FAiled checksum");
   }
   
   // Decoded
   //Serial.println(data);
   // Serial.println(""); 
   
  
  // Success
  results->bits = 9;
  if (results->bits < 6) {
    results->bits = 0;
    return false;
  }
  results->value = data;
  results->decode_type = NEC;

	return true;
}
#endif
