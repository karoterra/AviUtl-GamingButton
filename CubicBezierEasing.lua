-- AviUtl��script/CubicBezierEasing/CubicBezierEasing.lua��ǂݍ��ނ��߂̃t�@�C��

package.loaded["CubicBezierEasing"] = nil
local original_path = package.path
package.path = obj.getinfo("script_path") .. "CubicBezierEasing\\?.lua"
local CBE = require("CubicBezierEasing")
package.path = original_path
return CBE
