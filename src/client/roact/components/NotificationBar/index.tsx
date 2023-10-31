import Roact from "@rbxts/roact";
import { BindingTweenStatus, TweenableNumberBinding } from "client/roact/util/classes/TweenableNumberBinding";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { NotifcationData } from "shared/types/NotificationData";

interface NotificationBarProps {
	nextNotification: NotifcationData | undefined;
	updatedTime: number;
}

class BaseNotificationBar extends Roact.Component<NotificationBarProps> {
	private notificationPosition = new TweenableNumberBinding(-1.2, { time: 0.5 });

	render() {
		if (!this.props.nextNotification) return;

		const { text } = this.props.nextNotification;

		// TODO work with importance, connect close button, improve design

		return (
			<frame
				Key="NotificationBar"
				BackgroundTransparency={1}
				Position={new UDim2(0, 0, 0, -36)}
				Size={new UDim2(1, 0, 0.025, 36)}
			>
				<frame
					Key="Notification"
					BackgroundColor3={Color3.fromRGB(68, 68, 68)}
					BorderSizePixel={0}
					Position={this.notificationPosition.binding.map((value) => UDim2.fromScale(0.375, value))}
					Size={new UDim2(0.25, 0, 0.8, 0)}
				>
					<CornerAndPadding />

					<textlabel
						Key="Label"
						BackgroundTransparency={1}
						Font={Enum.Font.SourceSans}
						Size={new UDim2(0.8, 0, 1, 0)}
						Text={text}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
					>
						<UnifiedTextScaler />
					</textlabel>

					<textbutton
						Key="Close"
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Position={new UDim2(0.8, 0, 0, 0)}
						Size={new UDim2(0.2, 0, 1, 0)}
						Text="X"
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Right}
					/>
				</frame>
			</frame>
		);
	}

	didUpdate(previousProps: NotificationBarProps): void {
		const threadUpdatedTime = this.props.updatedTime;

		if (previousProps.updatedTime !== threadUpdatedTime) {
			this.notificationPosition.set(-1.2);

			const event = this.notificationPosition.tween(0.2);
			event.Once((status) => {
				if (status !== BindingTweenStatus.Completed) return;

				task.wait(0.5);
				if (this.props.updatedTime !== threadUpdatedTime) return;

				this.notificationPosition.tween(-1.2);
			});
		}
	}
}

export const NotificationBar = connectComponent(BaseNotificationBar, (state) => {
	return {
		nextNotification: state.notification.notificationQueued,
		updatedTime: state.notification.notificationLastUpdated,
	};
});
