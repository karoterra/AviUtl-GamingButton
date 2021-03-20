-- AviUtlでscript/CubicBezierEasing/CubicBezierEasing.luaを読み込むためのファイル

package.loaded["CubicBezierEasing"] = nil
local original_path = package.path
package.path = obj.getinfo("script_path") .. "CubicBezierEasing\\?.lua"
local CBE = require("CubicBezierEasing")
package.path = original_path
return CBE
