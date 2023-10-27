import { BoatTween, BoatTweenData, BoatTweenObject } from "@rbxts/boat-tween";
import { Binding, BindingFunction, createBinding } from "@rbxts/roact";

type DataWithoutGoal = Omit<BoatTweenData<NumberValue>, "Goal">;

export class TweenableBinding {
	public binding: Binding<number>;

	private updateBinding: BindingFunction<number>;
	private internalNumberValue: NumberValue;

	private sharedData?: DataWithoutGoal;
	private lastTween?: BoatTweenObject<NumberValue>;

	constructor(initialValue = 0, sharedData?: DataWithoutGoal) {
		[this.binding, this.updateBinding] = createBinding(initialValue);

		this.internalNumberValue = new Instance("NumberValue");
		this.internalNumberValue.Value = initialValue;
		this.internalNumberValue.Changed.Connect((value) => this.updateBinding(value));

		this.sharedData = sharedData;
	}

	public tween(value: number, data?: DataWithoutGoal) {
		this.lastTween?.Destroy();

		this.lastTween = BoatTween.Create(this.internalNumberValue, {
			...this.sharedData,
			...data,
			Goal: { Value: value },
		});

		this.lastTween.Play();
	}
}
