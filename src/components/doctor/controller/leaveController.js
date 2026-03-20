
const Leave  = require("../model/leaveModal");


const toMinutes = (time)=>{
    const[hr,mi] = time.split(":").map(Number)
    return hr*60+mi;
}
const getLeaveCategory = (slots) => {
  // Full Day
  if (!slots || slots.length === 0) {
    return "full_day";
  }

  let totalMinutes = 0;

  for (let slot of slots) {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    totalMinutes += (end - start);
  }

  // Half Day 
  if (totalMinutes === 240) {
    return "half_day";
  }

  // Custom
  return "custom";
};


//===========
exports.requestLeave = async (req, res) => {
  try {
    const { unavailableDates, leaveType, reason } = req.body;

    const today = new Date();

    for (let date in unavailableDates) {
      const leaveDate = new Date(date);


      const days =
 (leaveDate - today) / (1000 * 60 * 60 * 24);

      if (days < 3) {
        return res.status(400).json({
          message: `Apply 3 days before (${date})`
        });
      }

      const slots = unavailableDates[date];
      console.log(slots)


      const category = getLeaveCategory(slots);


      console.log(`Leave on ${date}: ${category}`);

      //  conflict check
      const existing = await Leave.findOne({
        doctorId: req.id,
        [`unavailableDates.${date}`]: { $exists: true }
      });

      if (existing) {
        const existingSlots = existing.unavailableDates.get(date);

        if (!existingSlots || existingSlots.length === 0) {
          return res.status(400).json({
            message: `Full day already booked on ${date}`
          });
        }

      
        if (!slots || slots.length === 0) {
          return res.status(400).json({
            message: `Cannot apply full day, slots already exist`
          });
        }

     
        for (let newSlot of slots) {
          for (let oldSlot of existingSlots) {

            const s1 = toMinutes(newSlot.startTime);
            const e1 = toMinutes(newSlot.endTime);
            const s2 = toMinutes(oldSlot.startTime);
            const e2 = toMinutes(oldSlot.endTime);

            if (s1 < e2 && s2 < e1) {
              return res.status(400).json({
                message: `Time conflict on ${date}`
              });
            }
          }
        }
      }
    }

    const leave = await Leave.create({
      doctorId: req.id,
      unavailableDates,
      leaveType,
      reason
    });

    res.json({
      success: true,
      message: "Leave requested",
      data: leave
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






