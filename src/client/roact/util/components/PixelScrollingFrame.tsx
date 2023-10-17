import Roact, { JsxInstanceProperties } from "@rbxts/roact";
import { TweenableRef } from "../classes/TweenableRef";
import { BoatTween, BoatTweenData, BoatTweenObject } from "@rbxts/boat-tween";
import { BoatTweenDataStyle } from "@rbxts/boat-tween/src/types/BoatTweenData";

interface PixelScrollingFrameProps {
	pixelsPerScroll: number;
	timePerScroll: number;
	tweenStyle?: BoatTweenDataStyle;

	scrollingFrameProps: Omit<JsxInstanceProperties<ScrollingFrame>, "ScrollingEnabled">;
}

export class PixelScrollingFrame extends Roact.Component<PixelScrollingFrameProps> {
	render() {
		let lastTween: BoatTweenObject<ScrollingFrame>;

		const onScroll = (frame: ScrollingFrame, input: InputObject) => {
			if (input.UserInputType !== Enum.UserInputType.MouseWheel) return;

			const newYPosition = frame.CanvasPosition.Y + this.props.pixelsPerScroll * input.Position.Z * -1;

			lastTween?.Stop();
			lastTween = BoatTween.Create(frame, {
				Time: this.props.timePerScroll,
				EasingStyle: this.props.tweenStyle ?? "Smoother",
				EasingDirection: "InOut",
				Goal: {
					CanvasPosition: new Vector2(0, newYPosition),
				},
			});

			lastTween.Play();
		};

		return (
			<scrollingframe
				{...this.props.scrollingFrameProps}
				ScrollingEnabled={false}
				Event={{ InputChanged: onScroll }}
			>
				{this.props[Roact.Children]}
			</scrollingframe>
		);
	}
}
