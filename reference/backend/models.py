import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# 初始化SQLAlchemy，将在app.py中进行实际配置
db = SQLAlchemy()

class User(db.Model):
    """用户模型 - 包含平台管理员、站点管理员和粉丝"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # platform_admin, station_admin, fan
    username = db.Column(db.String(50))  # 用户名/昵称
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, inactive, banned
    
    # 关联
    owned_stations = db.relationship('Station', backref='owner', lazy=True, 
                                    foreign_keys='Station.owner_id')
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'status': self.status
        }

class Station(db.Model):
    """站点模型 - 每个站点管理员可以有多个站点"""
    __tablename__ = 'stations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text)
    logo_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    settings = db.Column(db.JSON)  # 存储站点特定设置（JSON格式）
    status = db.Column(db.String(20), default='active')  # active, inactive, archived
    
    # 关联
    invite_codes = db.relationship('InviteCode', backref='station', lazy=True)
    tasks = db.relationship('Task', backref='station', lazy=True)
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'owner_id': self.owner_id,
            'description': self.description,
            'logo_url': self.logo_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'settings': self.settings,
            'status': self.status
        }

class InviteCode(db.Model):
    """邀请码模型 - 关联到特定站点"""
    __tablename__ = 'invite_codes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = db.Column(db.String(20), unique=True, nullable=False)
    station_id = db.Column(db.String(36), db.ForeignKey('stations.id'), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    usage_limit = db.Column(db.String(20), default='unlimited')
    is_focus_enabled = db.Column(db.Boolean, default=True)
    last_focus_change = db.Column(db.DateTime)
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'id': self.id,
            'code': self.code,
            'station_id': self.station_id,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'usage_limit': self.usage_limit,
            'is_focus_enabled': self.is_focus_enabled,
            'last_focus_change_timestamp': self.last_focus_change.isoformat() if self.last_focus_change else None
        }

class Task(db.Model):
    """任务模型 - 继承现有字段，但关联到站点"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = db.Column(db.String(36), db.ForeignKey('stations.id'), nullable=False)
    invite_code_id = db.Column(db.String(36), db.ForeignKey('invite_codes.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, completed, cancelled
    is_focus_task = db.Column(db.Boolean, default=False)
    time_limit_mode = db.Column(db.Boolean, default=False)
    flame_mode_enabled = db.Column(db.Boolean, default=True)
    bonus_points = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime)
    
    # 存储复杂字段为JSON
    time_config = db.Column(db.JSON)
    encouragement_image_url = db.Column(db.String(255))
    encouragement_message = db.Column(db.Text)
    
    # 关联
    participants = db.relationship('Participant', backref='task', lazy=True)
    invite_code = db.relationship('InviteCode', backref='tasks', lazy=True, foreign_keys=[invite_code_id])
    
    def to_dict(self):
        """将对象转换为字典"""
        try:
            return {
                'id': self.id,
                'station_id': self.station_id,
                'invite_code_id': self.invite_code_id,
                'title': self.title,
                'description': self.description,
                'points': self.points,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'due_date': self.due_date.isoformat() if self.due_date else None,
                'status': self.status,
                'is_focus_task': self.is_focus_task,
                'time_limit_mode': self.time_limit_mode,
                'flame_mode_enabled': self.flame_mode_enabled,
                'bonus_points': self.bonus_points,
                'completed_at': self.completed_at.isoformat() if self.completed_at else None,
                'time_config': self.time_config,
                'encouragement_image_url': self.encouragement_image_url,
                'encouragement_message': self.encouragement_message,
                # 不返回participants数据以避免性能问题和循环依赖
                'participants_count': len(self.participants) if hasattr(self, '_sa_instance_state') and hasattr(self, 'participants') else 0
            }
        except Exception as e:
            import traceback
            print(f"Task.to_dict错误 - 任务ID: {self.id if hasattr(self, 'id') else '未知'}, 错误: {str(e)}")
            traceback.print_exc()
            # 返回一个最小化的安全版本
            return {
                'id': self.id if hasattr(self, 'id') else None,
                'title': self.title if hasattr(self, 'title') else '无法加载任务数据',
                'error': f"数据转换错误: {str(e)}"
            }

class Participant(db.Model):
    """参与者模型 - 表示粉丝参与任务的记录"""
    __tablename__ = 'participants'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=False)
    fan_id = db.Column(db.String(36), db.ForeignKey('users.id'))  # 可为空，支持匿名参与
    name = db.Column(db.String(100), nullable=False)  # 粉丝昵称
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    submission_count = db.Column(db.Integer, default=0)
    points_earned = db.Column(db.Integer, default=0)
    total_points_for_task = db.Column(db.Integer, default=0)
    
    # 关联
    submissions = db.relationship('Submission', backref='participant', lazy=True)
    
    def to_dict(self):
        """将对象转换为字典"""
        try:
            return {
                'id': self.id,
                'task_id': self.task_id,
                'fan_id': self.fan_id,
                'name': self.name,
                'joined_at': self.joined_at.isoformat() if self.joined_at else None,
                'submission_count': self.submission_count,
                'points_earned': self.points_earned,
                'total_points_for_task': self.total_points_for_task,
                # 不返回submissions数据以避免性能问题和循环依赖
                'submissions_count': len(self.submissions) if hasattr(self, '_sa_instance_state') and hasattr(self, 'submissions') else 0
            }
        except Exception as e:
            import traceback
            print(f"Participant.to_dict错误 - ID: {self.id if hasattr(self, 'id') else '未知'}, 错误: {str(e)}")
            traceback.print_exc()
            # 返回一个最小化的安全版本
            return {
                'id': self.id if hasattr(self, 'id') else None,
                'name': self.name if hasattr(self, 'name') else '未知参与者',
                'error': f"数据转换错误: {str(e)}"
            }

class Submission(db.Model):
    """提交记录模型 - 粉丝任务提交"""
    __tablename__ = 'submissions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = db.Column(db.String(36), db.ForeignKey('participants.id'), nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    points_earned = db.Column(db.Integer, default=0)
    comment = db.Column(db.Text)
    is_abnormal = db.Column(db.Boolean, default=False)
    abnormal_reason = db.Column(db.Text)
    marked_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    marked_at = db.Column(db.DateTime)
    
    # 存储图片URL为JSON
    image_urls = db.Column(db.JSON)  # 存储图片URL列表
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'id': self.id,
            'participant_id': self.participant_id,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'points_earned': self.points_earned,
            'comment': self.comment,
            'is_abnormal': self.is_abnormal,
            'abnormal_reason': self.abnormal_reason,
            'marked_by': self.marked_by,
            'marked_at': self.marked_at.isoformat() if self.marked_at else None,
            'image_urls': self.image_urls
        }

class GlobalSettings(db.Model):
    """全局设置模型"""
    __tablename__ = 'global_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    default_encouragement_image_url = db.Column(db.String(255))
    default_encouragement_message = db.Column(db.Text, default="恭喜你完成了任务！继续加油！")
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'default_encouragement_image_url': self.default_encouragement_image_url,
            'default_encouragement_message': self.default_encouragement_message
        }

# 里程碑任务模型
class MilestoneTask(db.Model):
    """里程碑任务模型"""
    __tablename__ = 'milestone_tasks'
    
    milestone_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = db.Column(db.String(36), db.ForeignKey('stations.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    target_value = db.Column(db.Float, nullable=False)
    unit_of_measure = db.Column(db.String(50))
    current_value = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='PLANNED')  # PLANNED, ACTIVE, TARGET_MET, TARGET_MET_ACTIVE, COMPLETED, CANCELLED
    start_date = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    achieved_date = db.Column(db.DateTime)
    
    # 关联
    sub_tasks = db.relationship('SubTask', backref='milestone', lazy=True)
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'milestone_id': self.milestone_id,
            'station_id': self.station_id,
            'title': self.title,
            'description': self.description,
            'target_value': self.target_value,
            'unit_of_measure': self.unit_of_measure,
            'current_value': self.current_value,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'creation_date': self.creation_date.isoformat() if self.creation_date else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'achieved_date': self.achieved_date.isoformat() if self.achieved_date else None,
            'sub_tasks': [st.to_dict() for st in self.sub_tasks] if hasattr(self, '_sa_instance_state') else []
        }

class SubTask(db.Model):
    """子任务模型 - 里程碑任务的子任务"""
    __tablename__ = 'sub_tasks'
    
    sub_task_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = db.Column(db.String(36), db.ForeignKey('milestone_tasks.milestone_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50))  # Execution, Quantifiable, Review, Communication
    target_value = db.Column(db.Float)
    unit_of_measure = db.Column(db.String(50))
    current_value = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='PENDING')  # PENDING, ACTIVE, COMPLETED, CANCELLED, BLOCKED
    release_date = db.Column(db.DateTime)
    related_task_template_id = db.Column(db.String(36))
    points_on_completion = db.Column(db.Integer, default=0)
    completion_date = db.Column(db.DateTime)
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'sub_task_id': self.sub_task_id,
            'milestone_id': self.milestone_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'target_value': self.target_value,
            'unit_of_measure': self.unit_of_measure,
            'current_value': self.current_value,
            'status': self.status,
            'release_date': self.release_date.isoformat() if self.release_date else None,
            'related_task_template_id': self.related_task_template_id,
            'points_on_completion': self.points_on_completion,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None
        }

class VerificationCode(db.Model):
    """验证码模型 - 用于邮箱验证"""
    __tablename__ = 'verification_codes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), nullable=False, index=True)
    code = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'id': self.id,
            'email': self.email,
            'code': self.code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'verified': self.verified
        }
    
    def is_expired(self):
        """检查验证码是否过期"""
        return datetime.utcnow() > self.expires_at

class Feedback(db.Model):
    """用户反馈模型 - 存储用户反馈信息"""
    __tablename__ = 'feedback'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_type = db.Column(db.String(20), nullable=False)  # admin, fan
    feedback_type = db.Column(db.String(20), nullable=False)  # suggestion, bug, experience, other
    content = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    nickname = db.Column(db.String(100))
    invite_code = db.Column(db.String(20))
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, replied
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    reply = db.Column(db.Text)
    
    def to_dict(self):
        """将对象转换为字典"""
        return {
            'id': self.id,
            'user_type': self.user_type,
            'feedback_type': self.feedback_type,
            'content': self.content,
            'contact': self.contact,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id,
            'nickname': self.nickname,
            'invite_code': self.invite_code,
            'status': self.status,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by,
            'reply': self.reply
        } 