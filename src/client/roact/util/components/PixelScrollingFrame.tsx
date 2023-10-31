import Roact, { JsxInstanceProperties } from "@rbxts/roact";
import { BindingTweenData, TweenableNumberBinding } from "../classes/TweenableNumberBinding";

interface PixelScrollingFrameProps {
	pixelsPerScroll: number;
	tweenData: Partial<BindingTweenData>;

	scrollingFrameProps: Omit<JsxInstanceProperties<ScrollingFrame>, "ScrollingEnabled" | "CanvasPosition">;
}

export class PixelScrollingFrame extends Roact.Component<PixelScrollingFrameProps> {
	private position = new TweenableNumberBinding(0, this.props.tweenData);

	render() {
		const onScroll = (frame: ScrollingFrame, input: InputObject) => {
			if (input.UserInputType !== Enum.UserInputType.MouseWheel) return;

			const newYPosition = frame.CanvasPosition.Y + this.props.pixelsPerScroll * input.Position.Z * -1;
			this.position.tween(newYPosition);
		};

		return (
			<scrollingframe
				{...this.props.scrollingFrameProps}
				ScrollingEnabled={false}
				CanvasPosition={this.position.binding.map((value) => new Vector2(0, value))}
				Event={{ InputChanged: onScroll }}
			>
				{this.props[Roact.Children]}
			</scrollingframe>
		);
	}
}
