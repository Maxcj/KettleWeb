JobEntryJOB = Ext.extend(KettleTabDialog, {
	title: '作业',
	width: 600,
	height: 430,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var radioFilename = new Ext.form.Radio({boxLabel: '作业文件名', name: 'specification_method', checked: true});
		var wFilename = new Ext.form.TextField({flex: 1});
		var wbFilename = new Ext.Button({text: '选择..', handler: function() {
			var dialog = new FileExplorerWindow({includeFile: true, fileExt: 'ktr'});
			dialog.on('ok', function(v) {wFilename.setValue(v);dialog.close();});
			dialog.show();
		}});
		
		var radioByName = new Ext.form.Radio({boxLabel: '通过目录与名称指定作业', name: 'specification_method'});
		var wDirectory = new Ext.form.TextField({anchor: '-1', disabled: true});
		var wJobname = new Ext.form.TextField({flex: 1, disabled: true});
		var wbTransname = new Ext.Button({text: '选择..', disabled: true, handler: function() {
			var dialog = new RepositoryExplorerWindow();
			dialog.on('ok', function(dir, name) {
				wDirectory.setValue(dir);
				wTransname.setValue(name);
				me.setStepname(name);
				dialog.close();
			});
			dialog.show();
		}});
		
		var radioByReference = new Ext.form.Radio({boxLabel: '通过引用指定作业', name: 'specification_method'});
		var wByReference = new Ext.form.TextField({flex: 1, disabled: true});
		var transObjectId = new Ext.form.Hidden();
		var wbByReference = new Ext.Button({text: '选择..', disabled: true});
		
		var wPrevious = new Ext.form.Checkbox({fieldLabel: '复制上一步结果到位置参数'});
		var wPrevToParams = new Ext.form.Checkbox({fieldLabel: '复制上一步结果到命名参数'});
		var wEveryRow = new Ext.form.Checkbox({fieldLabel: '执行每一个输入行'});
		var wSlaveServer = new Ext.form.ComboBox({
			fieldLabel: '远程从服务器',
			displayField: 'name',
			valueField: 'name',
			anchor: '-10',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        store: getActiveGraph().getSlaveServerStore()
		});
		var wWaitingToFinish = new Ext.form.Checkbox({fieldLabel: '等待远程作业执行结束', disabled: true});
		var wFollowingAbortRemotely = new Ext.form.Checkbox({fieldLabel: '本地作业终止时远程作业也通知终止', disabled: true});
		var wExpandingRemoteJob = new Ext.form.Checkbox({fieldLabel: 'Expand child jobs and transformations on the', disabled: true});
		var wPassingExport = new Ext.form.Checkbox({fieldLabel: '将作业执行结果发送到从服务器上', disabled: true});

		var wSetLogfile = new Ext.form.Checkbox({fieldLabel: '指定日志文件'});
		var wAppendLogfile = new Ext.form.Checkbox({fieldLabel: '添加到日志文件尾', disabled: true});
		var wLogfile = new Ext.form.TextField({flex: 1, disabled: true});
		var wLogext = new Ext.form.TextField({fieldLabel: '日志文件后缀名', anchor: '-10', disabled: true});
		var wbLogFilename = new Ext.Button({text: '选择..', disabled: true, handler: function() {
			var dialog = new FileExplorerWindow({includeFile: true, fileExt: 'txt'});
			dialog.on('ok', function(v) {
				wLogfile.setValue(v.substring(0, v.length - 4));
				wLogext.setValue('txt');
				dialog.close();
			});
			dialog.show();
		}});
		var wCreateParentFolder = new Ext.form.Checkbox({fieldLabel: '创建父文件夹', disabled: true});
		var wAddDate = new Ext.form.Checkbox({fieldLabel: '日志文件包含日期', disabled: true});
		var wAddTime = new Ext.form.Checkbox({fieldLabel: '日志文件包含时间', disabled: true});
		var wLoglevel = new Ext.form.ComboBox({
			fieldLabel: '日志级别',
			displayField: 'desc',
			valueField: 'code',
			anchor: '-10',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        disabled: true,
			store: Ext.StoreMgr.get('logLevelStore')
		});
		
		var argStore = new Ext.data.JsonStore({
			fields: ['name']
		});
		var paramStore = new Ext.data.JsonStore({
			fields: ['name', 'stream_name', 'value']
		});
		
		this.initData = function() {
			JobEntryJOB.superclass.initData.apply(this, [cell]);
			
			var cell = this.getInitData();
			if('filename' == cell.getAttribute('specification_method')) {
				radioFilename.setValue(true);
				wFilename.setValue(cell.getAttribute('filename'));
			} else if('rep_name' == cell.getAttribute('specification_method')) {
				radioByName.setValue(true);
				wDirectory.setValue(cell.getAttribute('directory'));
				wJobname.setValue(cell.getAttribute('jobname'));
			} else if('rep_ref' == cell.getAttribute('specification_method')) {
				radioByReference.setValue(true);
				transObjectId.setValue(cell.getAttribute('trans_object_id'));
				wByReference.setValue(cell.getAttribute('referenceName'));
			}
			
			if(cell.getAttribute('supportsReferences') == 'N') 
				radioByReference.disable();
			
			wPrevious.setValue('Y' == cell.getAttribute('arg_from_previous'));
			wPrevToParams.setValue('Y' == cell.getAttribute('params_from_previous'));
			wEveryRow.setValue('Y' == cell.getAttribute('exec_per_row'));
			wSlaveServer.setValue(cell.getAttribute('slave_server_name'));
			wWaitingToFinish.setValue('Y' == cell.getAttribute('wait_until_finished'));
			wFollowingAbortRemotely.setValue('Y' == cell.getAttribute('follow_abort_remote'));
			wExpandingRemoteJob.setValue('Y' == cell.getAttribute('expandingRemoteJob'));
			wPassingExport.setValue('Y' == cell.getAttribute('passingExport'));

			wSetLogfile.setValue('Y' == cell.getAttribute('set_logfile'));
			wAppendLogfile.setValue('Y' == cell.getAttribute('set_append_logfile'));
			wLogfile.setValue(cell.getAttribute('logfile'));
			wCreateParentFolder.setValue('Y' == cell.getAttribute('create_parent_folder'));
			wLogext.setValue(cell.getAttribute('logext'));
			wAddDate.setValue('Y' == cell.getAttribute('add_date'));
			wAddTime.setValue('Y' == cell.getAttribute('add_time'));
			wLoglevel.setValue(cell.getAttribute('loglevel'));
			
			argStore.loadData(Ext.decode(cell.getAttribute('arguments')));
			paramStore.loadData(Ext.decode(cell.getAttribute('parameters')));
		};
		
		this.saveData = function(){
			var data = {};
			
			if(radioFilename.getValue() === true) {
				data.specification_method = 'filename';
				data.filename = wFilename.getValue();
			} else if(radioByName.getValue() === true) {
				data.specification_method = 'rep_name';
				data.directory = wDirectory.getValue();
				data.jobname = wJobname.getValue();
			} else if(radioByReference.getValue() === true) {
				data.specification_method = 'rep_ref';
				data.trans_object_id = transObjectId.getValue();
			}
			
			data.arg_from_previous = wPrevious.getValue() ? 'Y' : 'N';
			data.params_from_previous = wPrevToParams.getValue() ? 'Y' : 'N';
			data.exec_per_row = wEveryRow.getValue() ? 'Y' : 'N';
			data.slave_server_name = wSlaveServer.getValue();
			data.wait_until_finished = wWaitingToFinish.getValue() ? 'Y' : 'N';
			

			data.arguments = Ext.encode(argStore.toJson());
			data.parameters = Ext.encode(paramStore.toJson());
			
			return data;
		};
		
		this.tabItems = [{
			title: '作业设置',
			bodyStyle: 'padding: 5px',
			labelWidth: 1,
			xtype: 'KettleForm',
			items: [{
				xtype: 'fieldset',
				items: [{
					xtype: 'compositefield',
					items: [radioFilename, wFilename , wbFilename]
				}]
			},{
				xtype: 'fieldset',
				items: [radioByName, wDirectory, {
					xtype: 'compositefield',
					items: [wJobname, wbTransname]
				}]
			},{
				xtype: 'fieldset',
				items: [{
					xtype: 'compositefield',
					items: [radioByReference, transObjectId, wByReference]
				}]
			}, {
				xtype: 'button', text: 'NEW JOB'
			}]
		},{
			title: '高级',
			xtype: 'KettleForm',
			labelWidth: 210,
			items: [wPrevious, wPrevToParams, wEveryRow, wSlaveServer, wWaitingToFinish,wExpandingRemoteJob,wPassingExport,wFollowingAbortRemotely]
		},{
			title: '日志设置',
			xtype: 'KettleForm',
			labelWidth: 110,
			items: [wSetLogfile, wAppendLogfile, {
				xtype: 'compositefield',
				anchor: '-10',
				fieldLabel: '日志文件名',
				items: [wLogfile, wbLogFilename]
			}, wCreateParentFolder, wLogext, wLoglevel]
		}, {
			title: '位置参数',
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: '位置参数', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
		            allowBlank: false
		        })
			}],
			store: argStore
		}, {
			title: '命名参数',
			xtype: 'KettleEditorGrid',
			columns: [new Ext.grid.RowNumberer(), {
				header: '命名参数', dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			}, {
				header: '流列名', dataIndex: 'stream_name', width: 100, editor: new Ext.form.TextField()
			}, {
				header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
			}],
			store: paramStore
		}];
		
		JobEntryJOB.superclass.initComponent.call(this);
		
		radioFilename.on('check', function(cb, checked) {
			if(checked === true) {
				wFilename.enable();
				wbFilename.enable();
			} else {
				wFilename.disable();
				wbFilename.disable();
			}
		});
		
		radioByName.on('check', function(cb, checked) {
			if(checked === true) {
				wDirectory.enable();
				wTransname.enable();
				wbTransname.enable();
			} else {
				wDirectory.disable();
				wTransname.disable();
				wbTransname.disable();
			}
		});
		
		radioByReference.on('check', function(cb, checked) {
			if(checked === true) {
				wByReference.enable();
				wbByReference.enable();
			} else {
				wByReference.disable();
				wbByReference.disable();
			}
		});
		
		wSlaveServer.on('change', function(cb, newValue, oldValue) {
			if(Ext.isEmpty(newValue)) {
				wWaitingToFinish.disable();
				wFollowingAbortRemotely.disable();
			} else {
				wWaitingToFinish.enable();
				wFollowingAbortRemotely.enable();
			}
		});
		
	
		
		wSetLogfile.on('check', function(cb, checked) {
			if(checked === true) {
				wAppendLogfile.enable();
				wLogfile.enable();
				wbLogFilename.enable();
				wCreateParentFolder.enable();
				wLogext.enable();
				wAddDate.enable();
				wAddTime.enable();
				wLoglevel.enable();
			} else {
				wAppendLogfile.disable();
				wLogfile.disable();
				wbLogFilename.disable();
				wCreateParentFolder.disable();
				wLogext.disable();
				wAddDate.disable();
				wAddTime.disable();
				wLoglevel.disable();
			}
		});
	}
});

Ext.reg('JOB', JobEntryJOB);