import { useNotificationStore } from '@/entities/notification';
import { useUserStore } from '@/entities/user';

/**
 * 친구 관계 변경 유스케이스 묶음.
 * - user 엔티티의 상태를 바꾸고, 수락 시 notification 엔티티에 알림을 추가한다.
 *   (엔티티를 가로질러 조합하는 책임이 feature 의 역할)
 */
export function useManageFriends() {
  const friends = useUserStore((s) => s.friends); // 구독: 변경 시 리렌더
  const users = useUserStore((s) => s.users);
  const setFriendStatus = useUserStore((s) => s.setFriendStatus);
  const push = useNotificationStore((s) => s.push);
  void friends;

  const friendList = useUserStore.getState().friendList();
  const incomingRequests = useUserStore.getState().incomingRequests();
  const searchUsers = (q: string) => useUserStore.getState().searchUsers(q);

  const requestFriend = (id: string) => setFriendStatus(id, 'requested');
  const acceptFriend = (id: string) => {
    setFriendStatus(id, 'friend');
    const u = users.find((x) => x.id === id);
    if (u) push('friend', '친구 추가됨', `${u.name}님과 친구가 되었어요.`);
  };
  const removeFriend = (id: string) => setFriendStatus(id, 'none');

  return { friendList, incomingRequests, searchUsers, requestFriend, acceptFriend, removeFriend };
}
