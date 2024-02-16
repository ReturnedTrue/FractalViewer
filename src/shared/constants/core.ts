import { RunService } from "@rbxts/services";

const VERBOSE_DEBUG_MODE_ON = true;

export const VERBOSE_DEBUG_MODE = RunService.IsStudio() && VERBOSE_DEBUG_MODE_ON;
