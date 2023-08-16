import { BoatTween, BoatTweenData } from "@rbxts/boat-tween";
import { createRef } from "@rbxts/roact";
import { $warn } from "rbxts-transform-debug";

export class TweenableRef<T extends Instance> {
	public ref = createRef<T>();

	public tween(data: BoatTweenData<T>) {
		const currentInstance = this.ref.getValue();

		if (!currentInstance) {
			return $warn("ref currently holds no value, cannot tween");
		}

		const tweenObj = BoatTween.Create(currentInstance, data);
		tweenObj.Play();

		return tweenObj;
	}
}
