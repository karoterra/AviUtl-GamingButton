-- AviUtl‚Åscript/CubicBezierEasing/CubicBezierEasing.lua‚ğ“Ç‚İ‚Ş‚½‚ß‚Ìƒtƒ@ƒCƒ‹

package.loaded["CubicBezierEasing"] = nil
local original_path = package.path
package.path = obj.getinfo("script_path") .. "CubicBezierEasing\\?.lua"
local CBE = require("CubicBezierEasing")
package.path = original_path
return CBE
