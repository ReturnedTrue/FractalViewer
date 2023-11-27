import Roact from "@rbxts/roact";
import { GuiService } from "@rbxts/services";
import { TweenableNumberBinding } from "client/roact/util/classes/TweenableNumberBinding";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { NOTIFICATION_TIME } from "client/constants/notification";
import { NotifcationData } from "client/types/NotificationData";

const [guiInset] = GuiService.GetGuiInset();

interface NotificationBarProps {
	nextNotification: NotifcationData | undefined;
	updatedTime: number;
}

class BaseNotificationBar extends Roact.Component<NotificationBarProps> {
	private notificationPosition = new TweenableNumberBinding(-1.2, { time: 0.5 });

	render() {
		const notif = this.props.nextNotification;
		if (!notif) return;

		return (
			<frame
				Key="NotificationBar"
				BackgroundTransparency={1}
				Position={new UDim2(0, 0, 0, -guiInset.Y)}
				Size={new UDim2(1, 0, 0.015, guiInset.Y)}
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
						Size={new UDim2(1, 0, 1, 0)}
						RichText={true}
						Text={notif.text}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
					>
						<UnifiedTextScaler />
					</textlabel>
				</frame>
			</frame>
		);
	}

	didUpdate(previousProps: NotificationBarProps): void {
		const threadUpdatedTime = this.props.updatedTime;

		if (previousProps.updatedTime !== threadUpdatedTime) {
			this.notificationPosition.set(-1.2);

			this.notificationPosition.tween(0.2, (didComplete) => {
				if (!didComplete) return;

				task.wait(NOTIFICATION_TIME);
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
